import { Financials, Util } from '@dgx/server';
import { DGXEvent, EventListener, LocalEvent, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { deleteVehicle, getVinForVeh } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { saveStance } from 'modules/stances/service.stance';
import { applyUpgradesToVeh, getPriceForUpgrades, saveCosmeticUpgrades } from 'modules/upgrades/service.upgrades';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import { serverConfig } from '../../../../config';

@RPCRegister()
@EventListener()
class BennysManager extends Util.Singleton<BennysManager>() {
  private logger: winston.Logger;
  private spotData: Map<string, Bennys.SpotData>;
  private noChargeSpots: Set<string>; // For admin menu

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'BennysManager' });
    this.spotData = new Map();
    this.noChargeSpots = new Set();
  }

  private isSpotFromPlayer = (spotId: string, playerId: number) => this.spotData.get(spotId)?.player === playerId;

  public getSpotData = (spotId: string) => this.spotData.get(spotId);

  private getSpotByPlyId = (plyId: number) => {
    const data = Object.fromEntries(this.spotData);
    return Object.entries(data).find(([_, spotData]) => spotData.player === plyId)?.[0];
  };

  @RPCEvent('vehicles:bennys:isSpotFree')
  private _isSpotFree = (plyId: number, spotId: string) => {
    const spot = this.spotData.get(spotId);
    if (spot === undefined) return true;

    const netId = vinManager.getNetId(spot.vin);
    if (!netId) {
      this.spotData.delete(spotId);
      this.noChargeSpots.delete(spotId);
      this.logger.warn(`Could not find netId of veh (${spot.vin}). Spot has been cleared`);
      return true;
    }

    if (!DoesEntityExist(spot.entity)) {
      this.spotData.delete(spotId);
      this.noChargeSpots.delete(spotId);
      this.logger.warn(`Vehicle entity (${spot.vin}) does not exist. Spot has been cleared`);
      return true;
    }

    return false;
  };

  @RPCEvent('vehicles:bennys:enterSpot')
  private _enterSpot = (
    plyId: number,
    spotId: string,
    vehNetId: number,
    upgrades: Upgrades.Cosmetic,
    repair: Bennys.RepairInfo
  ) => {
    const veh = NetworkGetEntityFromNetworkId(vehNetId);
    if (!veh || !DoesEntityExist(veh)) {
      this.logger.error(`${Util.getName(plyId)} tried to enter bennys with an non-existing vehicle`);
      return false;
    }
    if (this.spotData.has(spotId)) return false;
    const vin = getVinForVeh(veh);
    if (!vin) {
      this.logger.error(`${Util.getName(plyId)} tried to enter bennys with a vehicle with no vin`);
      return false;
    }
    this.spotData.set(spotId, {
      player: plyId,
      vin,
      entity: veh,
      upgrades,
      repair,
    });
    Util.Log(
      'bennys:entered',
      {
        vin,
        spotId,
      },
      `${Util.getName(plyId)} has entered a bennys`,
      plyId
    );
    return true;
  };

  @DGXEvent('vehicles:bennys:leaveSpot')
  private _leaveSpot = (plyId: number, spotId: string) => {
    if (!this.spotData.has(spotId)) return;
    if (!this.isSpotFromPlayer(spotId, plyId)) return;
    this.spotData.delete(spotId);
    this.noChargeSpots.delete(spotId);
  };

  @DGXEvent('vehicles:bennys:resetVehicle')
  private resetVehicle = (plyId: number, spotId: string, checkOwner = false) => {
    const spotData = this.spotData.get(spotId);
    if (!spotData) {
      this.logger.warn(`Could not get data of spot ${spotId} for resetting vehicle`);
      return;
    }
    const netId = NetworkGetNetworkIdFromEntity(spotData.entity);
    if (!checkOwner) {
      applyUpgradesToVeh(netId, spotData.upgrades);
    } else {
      setTimeout(() => {
        const owner = NetworkGetEntityOwner(spotData.entity);
        FreezeEntityPosition(spotData.entity, false);
        if (owner === plyId) {
          deleteVehicle(spotData.entity);
        } else {
          applyUpgradesToVeh(netId, spotData.upgrades);
        }
      }, 2000);
    }

    this.logger.info(`Vehicle at bennys (${spotId}) has been reset to original upgrades`);
  };

  @DGXEvent('vehicles:bennys:buyUpgrades')
  private _buyUpgrades = async (
    plyId: number,
    spotId: string,
    cart: { component: keyof Upgrades.Cosmetic; data: any }[]
  ) => {
    const spotData = this.spotData.get(spotId);
    if (!spotData) {
      this.logger.warn(`Could not get data of spot ${spotId} for buying upgrades`);
      return;
    }
    if (!this.isSpotFromPlayer(spotId, plyId)) return;

    const upgrades: Partial<Upgrades.Cosmetic> = {};
    cart.forEach(({ component, data }) => {
      if (component.startsWith('extra_')) {
        if (!upgrades.extras) upgrades.extras = [];
        upgrades.extras.push(data);
      } else {
        upgrades[component] = data;
      }
    });

    const price = getPriceForUpgrades(spotData.entity, upgrades);

    const isNoChargeSpot = this.noChargeSpots.has(spotId);
    if (!isNoChargeSpot) {
      const plyCid = Util.getCID(plyId);
      const plyAccountId = Financials.getDefaultAccountId(plyCid);
      let purchaseSuccess = false;
      if (plyAccountId !== undefined) {
        purchaseSuccess = await Financials.purchase(
          plyAccountId,
          plyCid,
          price,
          `Aankoop tuningonderdelen in Benny's voor voertuig (${spotData.vin})`,
          serverConfig.bennys.taxId
        );
      }
      if (purchaseSuccess === false) {
        this.resetVehicle(plyId, spotId);
        return;
      }
    }

    if (vinManager.isVinFromPlayerVeh(spotData.vin)) {
      saveCosmeticUpgrades(spotData.vin, upgrades);
      const netId = vinManager.getNetId(spotData.vin);
      if (netId) {
        applyUpgradesToVeh(netId, upgrades);
        saveStance(netId);
      }
    }

    Util.Log(
      'bennys:purchaseUpgrades',
      {
        vin: spotData.vin,
        price: price,
        upgrades,
        isNoChargeSpot,
      },
      `${Util.getName(plyId)} has purchased upgrades for vehicle (${spotData.vin})`,
      plyId
    );
  };

  @RPCEvent('vehicles:bennys:getRepairTimes')
  private getRepairTimes = (plyId: number, spotId: string) => {
    const repairData = this.spotData.get(spotId)?.repair;
    if (!repairData) {
      this.logger.warn(`Could not get data of spot ${spotId} for getting repair times`);
      return;
    }
    const maxTimePerRepair = serverConfig.bennys.fullTaskBarTime / 2;
    return {
      body: maxTimePerRepair * (1 - repairData.body / 1000),
      engine: maxTimePerRepair * (1 - repairData.engine / 1000),
    };
  };

  public playerDropped = (plyId: number) => {
    const spotId = this.getSpotByPlyId(plyId);
    if (!spotId) return;
    this.resetVehicle(plyId, spotId, true);
    this.spotData.delete(spotId);
    this.noChargeSpots.delete(spotId);
    this.logger.info(`Player in bennys ${spotId} has left. Spot has been cleared`);
  };

  @RPCEvent('vehicles:bennys:payForRepair')
  private payForRepair = (plyId: number, spotId: string) => {
    if (!this.spotData.has(spotId)) {
      this.logger.warn(`Could not get data of spot ${spotId} for repairpayment`);
      return;
    }
    if (this.noChargeSpots.has(spotId)) {
      return true;
    }
    const price = this.spotData.get(spotId)?.repair?.price ?? 0;
    const paid = Financials.removeCash(plyId, price, 'bennys-repair');
    return paid;
  };

  // Do not expose to client side, only gets used in admin panel from serverside command
  @LocalEvent('vehicles:bennys:registerNoChargeSpot')
  private _registerNoChargeSpot = (plyId: number) => {
    const cid = Util.getCID(plyId);
    const spotId = `bennys_admin_${cid}`;
    this.noChargeSpots.add(spotId);
    this.logger.info(`Spot got registered as free by ${cid}`);
    Util.Log(
      'bennys:registerNoCharge',
      {
        spotId,
        cid,
      },
      `${Util.getName(plyId)} has registered a spot to be free`,
      plyId
    );
  };

  public isVehInNoChargeSpot = (veh: number) => {
    const foundSpot = Array.from(this.spotData.entries()).find(([_, data]) => data.entity === veh);
    if (!foundSpot) return false;
    return this.noChargeSpots.has(foundSpot[0]);
  };
}

const bennysManager = BennysManager.getInstance();
export default bennysManager;
