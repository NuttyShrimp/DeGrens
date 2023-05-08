import { Core, Inventory, Util } from '@dgx/server';
import winston from 'winston';
import { groupLogger } from '../logger';
import { charModule } from 'helpers/core';

// Manages the name that is used in the groups for the current player
class NameManager extends Util.Singleton<NameManager>() {
  private players: Map<number, { name: string; isVPNName: boolean }>;
  private logger: winston.Logger;

  constructor() {
    super();
    this.players = new Map();
    this.logger = groupLogger.child({ module: 'NameManager' });

    Core.onPlayerLoaded(player => {
      nameManager.updatePlayerName(player);
    });
  }

  public async updatePlayerName(player: Core.Characters.Player) {
    const hasVPN = await Inventory.doesInventoryHaveItems('player', String(player.citizenid), 'vpn'); // this version is more performant if you already have cid

    // If current name is already a custom generated and we about to update to another generated then just keep old.
    // Same other way around. If current name is already charname and ply dont have vpn, just keep already existing.
    // This is done to ensure player keeps same generated name after leaving/joining
    const playerNameData = this.players.get(player.citizenid);
    if (playerNameData && playerNameData.isVPNName === hasVPN) return;

    const name = hasVPN ? Util.generateName() : `${player.charinfo.firstname} ${player.charinfo.lastname}`;
    this.logger.debug(`Update name for ${player.name}(${player.citizenid}) to ${name}`);
    this.players.set(player.citizenid, { name, isVPNName: hasVPN });
  }

  public getName(cid: number): string {
    this.logger.silly(`Getting name for ${cid}`);
    const nameData = this.players.get(cid);
    if (!nameData) {
      throw new Error(`Player ${cid} did not have a name registered in groupsystem`);
    }
    return nameData.name;
  }

  // Generate names for all players in server on resource start
  public generateAllPlayerNames = () => {
    Object.values(charModule.getAllPlayers()).forEach(ply => {
      this.updatePlayerName(ply);
    });
  };
}

const nameManager = NameManager.getInstance();
export default nameManager;
