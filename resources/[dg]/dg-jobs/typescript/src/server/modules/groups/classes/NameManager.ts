import { Util } from '@dgx/server';
import winston from 'winston';

import { groupLogger } from '../logger';

// Manages the name that is used in the groups for the current player
class NameManager {
  private static instance: NameManager;
  public static getInstance() {
    if (!this.instance) {
      this.instance = new NameManager();
    }
    return this.instance;
  }
  private names: Map<number, string>;
  private logger: winston.Logger;

  constructor() {
    this.names = new Map();
    this.logger = groupLogger.child({ module: 'NameManager' });
  }

  public updatePlayerName(cid: number) {
    const player = DGCore.Functions.GetPlayerByCitizenId(cid);
    const hasVPN = player.Functions.GetItemByName('vpn');
    const name = hasVPN
      ? Util.generateName()
      : `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}`;
    this.logger.debug(`Update name for ${player.PlayerData.name}(${cid}) to ${name}`);
    this.names.set(player.PlayerData.citizenid, name);
  }

  public getName(cid: number) {
    this.logger.silly(`Getting name for ${cid}`);
    if (!this.names.has(cid)) {
      this.updatePlayerName(cid);
    }
    return this.names.get(cid);
  }
}

const nameManager = NameManager.getInstance();

export default nameManager;
