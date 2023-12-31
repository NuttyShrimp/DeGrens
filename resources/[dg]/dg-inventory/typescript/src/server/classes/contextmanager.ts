import { Util } from '@dgx/server';
import { DGXEvent, EventListener } from '@dgx/server/src/decorators';
import inventoryManager from 'modules/inventories/manager.inventories';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

// PREPARE YOUR EYES FOR THIS MESS - MUCH LOVE JENS
@EventListener()
class ContextManager extends Util.Singleton<ContextManager>() {
  private readonly logger: winston.Logger;

  // We store both ways for ease of access, no need for annoying object.keys loops ect
  // playersById - Key: Inventory ID - Value: Array with server IDs of players who have inventory open
  // idsByPlayer - Key: Server ID - Value: Tuple of 2 Inventory IDs which player has open
  private readonly open: { playersById: Map<string, number[]>; idsByPlayer: Map<number, [string, string]> };

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'ContextManager' });
    this.open = { playersById: new Map(), idsByPlayer: new Map() };
  }

  public playerOpened = (player: number, ids: [string, string]) => {
    // Add to playersById
    ids.forEach(id => {
      const playersById = this.getPlayersById(id);
      playersById.push(player);
      // generate set and spread back to array incase a duplicate occurs
      this.open.playersById.set(id, [...new Set(playersById)]);
    });

    // Add to idsByPlayer
    const idsByPlayer = this.getIdsByPlayer(player);
    if (idsByPlayer) {
      this.logger.error(
        `Player ${player} opened ${ids[0]} and ${ids[1]} while still having ${idsByPlayer[0]} and ${idsByPlayer[1]} registered as open`
      );
    }
    this.open.idsByPlayer.set(player, ids);

    this.logger.silly(`Player ${player} opened ${ids[0]} and ${ids[1]}`);
  };

  @DGXEvent('inventory:server:closed')
  public playerClosed = (player: number, playerUnloaded = false) => {
    const openIds = this.getIdsByPlayer(player);
    if (!openIds) {
      if (!playerUnloaded) {
        this.logger.warn(`Player ${player} closed inventory without having any registered as open.`);
      }
      return;
    }

    // Remove from playersById
    openIds.forEach(id => {
      let playersById = this.getPlayersById(id);
      playersById = playersById.filter(i => i !== player);
      if (playersById.length == 0) {
        this.open.playersById.delete(id);
        inventoryManager.save(id);
        return;
      }
      this.open.playersById.set(id, playersById);
    });

    // Remove from idsByPlayer
    this.open.idsByPlayer.delete(player);

    this.logger.silly(`Player ${player} closed ${openIds[0]} and ${openIds[1]}`);
  };

  public getPlayersById = (id: string) => this.open.playersById.get(id) ?? [];

  public getPlayersByIds = (ids: string[]) => {
    const playersWithAnyOpen = new Set<number>();

    for (const id of ids) {
      this.getPlayersById(id).forEach(ply => playersWithAnyOpen.add(ply));
    }

    return [...playersWithAnyOpen];
  };

  public getIdsByPlayer = (player: number) => this.open.idsByPlayer.get(player);
}

const contextManager = ContextManager.getInstance();
export default contextManager;
