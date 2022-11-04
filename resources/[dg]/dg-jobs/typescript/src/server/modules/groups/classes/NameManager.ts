import { Inventory, Util } from '@dgx/server';
import { EventListener, LocalEvent } from '@dgx/server/decorators';
import winston from 'winston';

import { groupLogger } from '../logger';

// Manages the name that is used in the groups for the current player
@EventListener()
class NameManager extends Util.Singleton<NameManager>() {
  private players: Map<number, { name: string; isVPNName: boolean }>;
  private logger: winston.Logger;

  constructor() {
    super();
    this.players = new Map();
    this.logger = groupLogger.child({ module: 'NameManager' });
  }

  public async updatePlayerName(cid: number) {
    const player = DGCore.Functions.GetPlayerByCitizenId(cid);
    const hasVPN = await Inventory.doesInventoryHaveItems('player', String(cid), 'vpn'); // this version is more performant if you already have cid

    // If current name is already a custom generated and we about to update to another generated then just keep old.
    // Same other way around. If current name is already charname and ply dont have vpn, just keep already existing.
    // This is done to ensure player keeps same generated name after leaving/joining
    const playerNameData = this.players.get(cid);
    if (playerNameData && playerNameData.isVPNName === hasVPN) return;

    const name = hasVPN
      ? Util.generateName()
      : `${player.PlayerData.charinfo.firstname} ${player.PlayerData.charinfo.lastname}`;
    this.logger.debug(`Update name for ${player.PlayerData.name}(${cid}) to ${name}`);
    this.players.set(player.PlayerData.citizenid, { name, isVPNName: hasVPN });
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
    (
      Object.values({
        ...DGCore.Functions.GetQBPlayers(),
      }) as Player[]
    ).forEach((ply: Player) => {
      this.updatePlayerName(ply.PlayerData.citizenid);
    });
  };

  @LocalEvent('DGCore:Server:PlayerLoaded')
  private _playerJoined = ({ PlayerData }: { PlayerData: PlayerData }) => {
    nameManager.updatePlayerName(PlayerData.citizenid);
  };
}

const nameManager = NameManager.getInstance();
export default nameManager;
