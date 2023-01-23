import { Util } from '@dgx/server';
import { RPCEvent, RPCRegister } from '@dgx/server/decorators';
import repository from 'services/repository';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { Gang } from './gang';

@RPCRegister()
class GangManager extends Util.Singleton<GangManager>() {
  private readonly logger: winston.Logger;
  private readonly gangs: Map<Gangs.Gang['name'], Gang>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'GangManager' });
    this.gangs = new Map();
  }

  public loadAllGangs = async () => {
    const gangData = await repository.getAllGangs();
    for (const data of gangData) {
      const gang = new Gang(data.name, data.label, data.owner);
      this.gangs.set(gang.name, gang);
    }
    this.logger.info(`${gangData.length} gang(s) has/have been initiated`);
  };

  public createGang = async (name: string, label: string, owner: number) => {
    const newGang = new Gang(name, label, owner);
    this.gangs.set(newGang.name, newGang);
    await repository.insertNewGang(name, label, owner);
    newGang.addMember(owner, true);
    this.logger.info(`A new gang ${name} with owner ${owner} has been created`);
    Util.Log('gangs:create', { name, label, owner }, `A new gang ${name} with owner ${owner} has been created`);
  };

  public getPlayerGang = (cid: number) => {
    return Array.from(this.gangs.values()).find(g => g.isMember(cid));
  };

  //#region Helpers
  public getGang = (gangName: string, suppressError = false) => {
    const gang = this.gangs.get(gangName);
    if (!gang && !suppressError) {
      this.logger.warn(`Tried to get a nonexistent gang ${gangName}`);
      Util.Log(
        'gangs:invalidGang',
        {
          gangName,
        },
        `Tried to get a nonexistent gang ${gangName}`,
        undefined,
        true
      );
    }
    return gang;
  };

  private checkActionPerms = (gang: Gang, cid: number) => {
    const hasPerms = gang.hasPerms(cid);
    if (!hasPerms) {
      this.logger.warn(
        `${cid} tried to do an action for gang ${gang.name} which requires perms but player does not have perms`
      );
      Util.Log(
        'gangs:noPermsForAction',
        {
          cid,
          gangName: gang.name,
        },
        `${cid} tried to do an action which requires perms but player does not have perms`
      );
    }
    return hasPerms;
  };

  private checkIsMember = (gang: Gang, cid: number) => {
    const isMember = gang.isMember(cid);
    if (!isMember) {
      this.logger.warn(`Tried to perform action but player ${cid} is not a member of ${gang.name}`);
      Util.Log(
        'gangs:actionOnNonMember',
        {
          cid,
          gangName: gang.name,
        },
        `Tried to perform action but player ${cid} is not a member`
      );
    }
    return isMember;
  };
  //#endregion

  //#region Events
  @RPCEvent('gangs:server:leave')
  private _leaveGang = (plyId: number, gangName: string) => {
    const plyCid = Util.getCID(plyId);
    const gang = this.getGang(gangName);
    if (!gang) return false;
    if (gang.isOwner(plyCid)) return false;
    if (!this.checkIsMember(gang, plyCid)) return false;
    gang.removeMember(plyCid);
    this.logger.info(`${plyCid} has left gang ${gangName}`);
    Util.Log(
      'gangs:memberLeft',
      {
        gangName,
      },
      `${Util.getName(plyId)} has left gang ${gangName}`,
      plyId
    );
    return true;
  };

  @RPCEvent('gangs:server:kick')
  private _kickMember = (plyId: number, gangName: string, targetCid: number) => {
    const plyCid = Util.getCID(plyId);
    const gang = this.getGang(gangName);
    if (!gang) return false;
    if (!this.checkActionPerms(gang, plyCid)) return false;
    if (!this.checkIsMember(gang, targetCid)) return false;

    // Check if tryna kick owner
    if (gang.isOwner(targetCid)) {
      this.logger.warn(`${plyCid} tried to kick owner of gang ${gangName}`);
      Util.Log(
        'gangs:kickOwner',
        { gangName, targetCid },
        `${Util.getName(plyId)} tried to kick the owner of gang ${gangName}`,
        plyId,
        true
      );
      return false;
    }

    gang.removeMember(targetCid);
    this.logger.info(`${plyCid} has kicked ${targetCid} from gang ${gangName}`);
    Util.Log(
      'gangs:kickMember',
      {
        gangName,
        targetCid,
      },
      `${Util.getName(plyId)} has kicked ${targetCid} from gang ${gangName}`,
      plyId
    );
    return true;
  };

  @RPCEvent('gangs:server:promote')
  private _promoteMember = (plyId: number, gangName: string, targetCid: number) => {
    const plyCid = Util.getCID(plyId);
    const gang = this.getGang(gangName);
    if (!gang) return false;
    if (!this.checkActionPerms(gang, plyCid)) return false;
    if (!this.checkIsMember(gang, targetCid)) return false;
    if (gang.isOwner(targetCid)) return false;
    gang.modifyMemberPerms(targetCid, true);
    this.logger.info(`${targetCid} has been promoted in gang ${gangName} by ${plyCid}`);
    Util.Log(
      'gangs:promoteMember',
      {
        targetCid,
        gangName,
      },
      `${Util.getName(plyId)} has promoted ${targetCid} in gang ${gangName}`,
      plyId
    );
    return true;
  };

  @RPCEvent('gangs:server:degrade')
  private _degradeMember = (plyId: number, gangName: string, targetCid: number) => {
    const plyCid = Util.getCID(plyId);
    const gang = this.getGang(gangName);
    if (!gang) return false;
    if (!this.checkActionPerms(gang, plyCid)) return false;
    if (!this.checkIsMember(gang, targetCid)) return false;
    if (gang.isOwner(targetCid)) return false;
    gang.modifyMemberPerms(targetCid, false);
    this.logger.info(`${targetCid} has been degraded in gang ${gangName} by ${plyCid}`);
    Util.Log(
      'gangs:degradeMember',
      {
        targetCid,
        gangName,
      },
      `${Util.getName(plyId)} has degraded ${targetCid} in gang ${gangName}`,
      plyId
    );
    return true;
  };

  @RPCEvent('gangs:server:transfer')
  private _transferOwnership = (plyId: number, gangName: string, targetCid: number) => {
    const plyCid = Util.getCID(plyId);
    const gang = this.getGang(gangName);
    if (!gang) return false;

    if (!gang.isOwner(plyCid)) {
      this.logger.warn(`${plyCid} tried to transfer ownership but was not owner`);
      Util.Log(
        'gangs:notOwner',
        { gangName, targetCid },
        `${Util.getName(plyId)} tried to transfer ownership but was not owner`,
        plyId,
        true
      );
      return false;
    }

    if (!this.checkIsMember(gang, targetCid)) return false;

    gang.changeOwner(targetCid);
    this.logger.info(`${plyCid} has transfered ownership of gang ${gangName} to ${targetCid}`);
    Util.Log(
      'gangs:transferOwnership',
      {
        targetCid,
        gangName,
      },
      `${Util.getName(plyId)} has transfered ownership of gang ${gangName} to ${targetCid}`,
      plyId
    );
    return true;
  };

  @RPCEvent('gangs:server:add')
  private _addMember = async (plyId: number, gangName: string, targetCid: number) => {
    const plyCid = Util.getCID(plyId);
    const gang = this.getGang(gangName);
    if (!gang) return false;
    if (!this.checkActionPerms(gang, plyCid)) return false;
    if (gang.isMember(targetCid)) return false;

    const targetPlayer = DGCore.Functions.GetPlayerByCitizenId(targetCid);
    if (!targetPlayer) {
      this.logger.warn(`${plyCid} tried to add offline member with cid ${targetCid}`);
      return false;
    }

    // Handle in different thread because RPC will timeout while waiting for notif accept and we need to return success value to client
    setImmediate(() => {
      gang.requestPlayerToJoin(plyId, targetPlayer.PlayerData);
    });

    return true;
  };
  //#endregion
}

const gangManager = GangManager.getInstance();
export default gangManager;
