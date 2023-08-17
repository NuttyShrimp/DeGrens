import { Financials, Jobs, Phone, Police, Reputations, Util, Vehicles } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { ExportDecorators, RPCEvent, RPCRegister } from '@dgx/server/src/decorators';
import { charModule } from 'helpers/core';
import config, { getClassConfig, tryClassChanceEntry } from 'helpers/config';
import { VEHICLE_CLASS_ORDER } from '../constants';
import { Contract } from './contract';
import { getRandomModelFromPoolForClass } from 'helpers/pool';
import boostManager from './boostmanager';

const { Export, ExportRegister } = ExportDecorators<'carboosting'>();

@RPCRegister()
@ExportRegister()
class ContractManager {
  private readonly logger: winston.Logger;
  private contractId: number;
  private readonly signedUp: Set<number>; // plyid
  private readonly schedulingThreads: Map<number, NodeJS.Timer>; // plyid -> thread
  private readonly contracts: Map<number, Contract>;
  private readonly timedOutClasses: Set<Vehicles.Class>;

  constructor() {
    this.logger = mainLogger.child({ module: 'ContractManager' });
    this.contractId = 0;
    this.signedUp = new Set();
    this.schedulingThreads = new Map();
    this.contracts = new Map();
    this.timedOutClasses = new Set();
  }

  public handleCharacterUnloaded = (plyId: number) => {
    this.removeActivePlayer(plyId, true);
  };

  private addActivePlayer = (plyId: number): boolean => {
    if (this.signedUp.has(plyId)) {
      this.logger.warn(`Tried to add player ${plyId} as active player but was already active`);
      return false;
    }

    this.signedUp.add(plyId);
    this.logger.silly(`Added ${plyId} as active player`);
    this.startPersonalContractSchedulingThread(plyId);

    return true;
  };

  private removeActivePlayer = (plyId: number, ignoreWarn = false): boolean => {
    if (!this.signedUp.has(plyId)) {
      if (!ignoreWarn) {
        this.logger.warn(`Tried to remove player ${plyId} as active player but was not active`);
      }
      return false;
    }

    this.stopPersonalContractSchedulingThread(plyId);
    this.signedUp.delete(plyId);
    this.logger.silly(`Removed ${plyId} as active player`);

    return true;
  };

  private startPersonalContractSchedulingThread = (plyId: number) => {
    this.stopPersonalContractSchedulingThread(plyId); // stop existing scheduling thread

    /* 
    every x seconds, we pick a random class the player has enough rep for. 
    if player currently does not have an active contract for that class, we give him one depending on chance to actually get contract for class
    else he gets none
    */

    const thread = setInterval(
      () => {
        if (!this.signedUp.has(plyId)) {
          this.logger.warn(`Tried to schedule contract for player ${plyId} but was not active`);
          this.removeActivePlayer(plyId);
          return;
        }

        const cid = charModule.getPlayer(plyId)?.citizenid;
        if (!cid) {
          this.logger.error(`Tried to schedule contract for player ${plyId} but could not find cid`);
          this.removeActivePlayer(plyId);
          return;
        }

        // dont receive new contracts when doing boost
        if (boostManager.isPlayerInBoost(cid)) return;

        const accessibleClasses = this.getAccessiblePersonalClassesForPlayer(cid);
        const choosenClass = accessibleClasses[Math.floor(Math.random() * accessibleClasses.length)];
        if (!choosenClass) return;

        if (!this.canAddContractForClass(choosenClass)) return;
        if (this.doesPlayerOwnContractOfClass(cid, choosenClass)) return;

        const model = getRandomModelFromPoolForClass(choosenClass);
        if (!model) {
          this.logger.error(`Could get random model from ${choosenClass} pool`);
          return;
        }

        this.createContract(model, cid);
      },
      Util.isDevEnv() ? 5000 : config.contracts.interval.personal * 60 * 1000
    );

    this.schedulingThreads.set(plyId, thread);
    this.logger.debug(`Started contract scheduling thread for player ${plyId}`);
  };

  public startGlobalContractSchedulingThread = () => {
    const classes = VEHICLE_CLASS_ORDER.reduce<Vehicles.Class[]>((acc, cur) => {
      if (getClassConfig(cur).contractType === 'global') {
        acc.push(cur);
      }
      return acc;
    }, []);

    setInterval(
      () => {
        const choosenClass = classes[Math.floor(Math.random() * classes.length)];
        if (!choosenClass) return;

        if (!this.canAddContractForClass(choosenClass)) return;
        if (this.doesGlobalContractOfClassExist(choosenClass)) return;

        const model = getRandomModelFromPoolForClass(choosenClass);
        if (!model) {
          this.logger.error(`Could get random model from ${choosenClass} pool`);
          return;
        }

        this.createContract(model);
      },
      Util.isDevEnv() ? 5000 : config.contracts.interval.global * 60 * 1000
    );
  };

  private stopPersonalContractSchedulingThread = (plyId: number) => {
    const thread = this.schedulingThreads.get(plyId);
    if (!thread) return;

    clearInterval(thread);
    this.schedulingThreads.delete(plyId);
    this.logger.debug(`Stopped contract scheduling thread for player ${plyId}`);
  };

  private canAddContractForClass = (vehicleClass: Vehicles.Class) => {
    if (this.timedOutClasses.has(vehicleClass)) {
      return false;
    }
    if (!tryClassChanceEntry(vehicleClass, 'contract')) {
      return false;
    }
    if (!this.areClassPoliceRequirementsMet(vehicleClass, 'boost')) {
      return false;
    }
    return true;
  };

  public areClassPoliceRequirementsMet = (vehicleClass: Vehicles.Class, type: Carboosting.DropoffType) => {
    return Police.canDoActivity(`carboost_${type}_${vehicleClass}`);
  };

  public getReputation = (cid: number): number => {
    return Reputations.getReputation(cid, 'carboosting') ?? 0;
  };

  public updateReputation = (cid: number, amount: number) => {
    Reputations.setReputation(cid, 'carboosting', old => Math.max(0, (old ?? 0) + amount));
  };

  private getClassForReputation = (reputation: number) => {
    for (let i = VEHICLE_CLASS_ORDER.length - 1; i >= 0; i--) {
      if (getClassConfig(VEHICLE_CLASS_ORDER[i]).reputation.required <= reputation) {
        return VEHICLE_CLASS_ORDER[i];
      }
    }
  };

  /**
   * @returns array of classes players has enough reputation for & are available for personal contracts
   */
  private getAccessiblePersonalClassesForPlayer = (cid: number): Vehicles.Class[] => {
    const reputation = this.getReputation(cid);
    const accessibleClasses: Vehicles.Class[] = [];
    for (const vehicleClass of VEHICLE_CLASS_ORDER) {
      if (getClassConfig(vehicleClass).contractType !== 'personal') continue;
      if (getClassConfig(vehicleClass).reputation.required > reputation) continue;
      accessibleClasses.push(vehicleClass);
    }
    return accessibleClasses;
  };

  private doesPlayerHaveAccessToClass = (cid: number, vehicleClass: Vehicles.Class) => {
    const reputation = this.getReputation(cid);
    return reputation >= getClassConfig(vehicleClass).reputation.required;
  };

  private doesPlayerOwnContractOfClass = (cid: number, vehicleClass: Vehicles.Class) => {
    for (const [_, c] of this.contracts) {
      if (c.getOwner() !== cid) continue;
      if (c.vehicleClass !== vehicleClass) continue;
      return true;
    }
    return false;
  };

  private doesGlobalContractOfClassExist = (vehicleClass: Vehicles.Class) => {
    for (const [_, c] of this.contracts) {
      if (c.getOwner() !== null) continue;
      if (c.vehicleClass !== vehicleClass) continue;
      return true;
    }
    return false;
  };

  @Export('createContract')
  public createContract(model: string, ownerCid?: number) {
    try {
      const id = ++this.contractId;
      const contract = new Contract(id, model, ownerCid);
      this.contracts.set(id, contract);

      // if owner provided, only send notif to that player
      // else send to every signed up player who has access to the class
      const notifTargets: number[] = [];
      if (ownerCid) {
        if (this.doesPlayerHaveAccessToClass(ownerCid, contract.vehicleClass)) {
          const plyId = charModule.getServerIdFromCitizenId(ownerCid);
          if (plyId) {
            notifTargets.push(plyId);
          }
        }
      } else {
        for (const plyId of this.signedUp) {
          const cid = charModule.getPlayer(plyId)?.citizenid;
          if (!cid || !this.doesPlayerHaveAccessToClass(cid, contract.vehicleClass)) continue;
          notifTargets.push(plyId);
        }
      }

      notifTargets.forEach(plyId => {
        Phone.showNotification(plyId, {
          id: `carboosting-new-contract-${Date.now()}`,
          title: 'Carboosting',
          description: `Nieuw ${contract.vehicleClass} klasse contract beschikbaar`,
          icon: 'car',
        });
      });
    } catch (e) {
      this.logger.error(`Could not create contract: ${e}`);
    }
  }

  public unregisterContract = (contractId: number) => {
    this.contracts.delete(contractId);
  };

  @RPCEvent('carboosting:contracts:toggleSignedUp')
  private _toggleSignedUp = (plyId: number, toggle: boolean): boolean => {
    return toggle ? this.addActivePlayer(plyId) : this.removeActivePlayer(plyId);
  };

  @RPCEvent('carboosting:contracts:getUIData')
  private _getUIData = (plyId: number): Carboosting.UIData => {
    const cid = charModule.getPlayer(plyId)?.citizenid;
    if (!cid) throw new Error(`cannot get UI data: no cid for player ${plyId}`);

    const playerRep = this.getReputation(cid);
    const currentClass = this.getClassForReputation(playerRep);
    if (!currentClass) throw new Error(`cannot get UI data: could not find current class for reputation: ${playerRep}`);

    const nextClassIdx = VEHICLE_CLASS_ORDER.indexOf(currentClass) + 1;
    const nextClass = VEHICLE_CLASS_ORDER[nextClassIdx];

    let reputationPercentage = 0;
    if (nextClass !== undefined) {
      const currentRequired = getClassConfig(currentClass).reputation.required;
      const reputationAtCurrentClass = playerRep - currentRequired;
      const reputationTillNextClass = getClassConfig(nextClass).reputation.required - currentRequired;
      reputationPercentage = Math.floor((reputationAtCurrentClass * 100) / reputationTillNextClass);
    }

    const contracts: Carboosting.UIData['contracts'] = [];
    for (const [_, c] of this.contracts) {
      if (!c.canPlayerDoContract(cid, playerRep)) continue;
      contracts.push(c.buildUIData());
    }

    return {
      signedUp: this.signedUp.has(plyId),
      contracts,
      reputation: {
        currentClass,
        nextClass,
        percentage: reputationPercentage,
      },
    };
  };

  @RPCEvent('carboosting:contracts:accept')
  private _acceptContract = async (plyId: number, contractId: number, type: Carboosting.DropoffType) => {
    const cid = charModule.getPlayer(plyId)?.citizenid;
    if (!cid) {
      this.logger.error(`Failed to decline contract: could not get cid for player ${plyId}`);
      return 'Failed to get cid';
    }

    if (boostManager.isPlayerInBoost(cid)) return 'You currently have another contract active';

    const contract = this.contracts.get(contractId);
    if (!contract) return 'This contract does not exist anymore';
    if (!contract.canPlayerDoContract(cid)) return 'You are not allowed to do this contract';

    if (!this.areClassPoliceRequirementsMet(contract.vehicleClass, type))
      return 'This contract cannot be started at this time';

    if (type === 'scratch') {
      const alreadyHasVinscratchOfClass = await Vehicles.doesPlayerHaveVinscratchedVehicleOfClass(
        cid,
        contract.vehicleClass
      );
      if (alreadyHasVinscratchOfClass) return 'You already have a vinscratched vehicle of this class';
    }

    const group = Jobs.getGroupByCid(cid);
    if (!group) return 'You must be in a group to do this';

    const changedJob = Jobs.changeJob(group.id, 'carboosting');
    if (!changedJob) return 'Could not change group activity, check phone for more info';

    // payment
    const classConfig = getClassConfig(contract.vehicleClass);
    const price = classConfig.price[type];
    const paymentSuccess = await Financials.cryptoRemove(plyId, 'Suliro', price);
    if (!paymentSuccess) {
      Jobs.changeJob(group.id, null);
      return 'Could not pay for contract';
    }

    // add as timedoutclass for certain classes
    if (classConfig.timeoutAfterAccepting) {
      this.timedOutClasses.add(contract.vehicleClass);
      setTimeout(
        () => this.timedOutClasses.delete(contract.vehicleClass),
        classConfig.timeoutAfterAccepting * 60 * 1000
      );
    }

    boostManager.startBoost({
      plyId,
      cid,
      groupId: group.id,
      vehicleClass: contract.vehicleClass,
      vehicleModel: contract.model,
      type,
    });
    contract.destroy();
  };

  @RPCEvent('carboosting:contracts:decline')
  private _declineContract = (plyId: number, contractId: number) => {
    const cid = charModule.getPlayer(plyId)?.citizenid;
    if (!cid) {
      this.logger.error(`Failed to decline contract: could not get cid for player ${plyId}`);
      return 'Failed to get cid';
    }

    const contract = this.contracts.get(contractId);
    if (!contract) return 'Contract does not exist anymore';

    if (contract.getOwner() === null) {
      this.logger.warn(`Player ${plyId} tried to decline global contract`);
      return 'Global contracts cannot be declined';
    }

    contract.destroy();
  };
}

const contractManager = new ContractManager();
export default contractManager;
