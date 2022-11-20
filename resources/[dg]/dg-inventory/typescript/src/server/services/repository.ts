import { SQL } from '@dgx/server';
import { Util } from '@dgx/shared';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

class Repository extends Util.Singleton<Repository>() {
  private logger: winston.Logger;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Repository' });
  }

  // Cannot use destructuring as we need these to be in specific order
  private stateToParams = (state: Inventory.ItemState): Repository.UpdateParameters => {
    return [
      state.id,
      state.name,
      state.inventory,
      JSON.stringify(state.position),
      state.quality,
      state.hotkey,
      state.lastDecayTime,
      JSON.stringify(state.metadata),
    ];
  };

  private resultToState = (state: Repository.FetchResult): Inventory.ItemState => {
    return {
      ...state,
      metadata: JSON.parse(state.metadata) as { [key: string]: any },
      position: JSON.parse(state.position) as Vec2,
    };
  };

  public fetchItems = async (invId: string): Promise<Inventory.ItemState[]> => {
    const query = `SELECT * FROM inventory_items WHERE inventory = ?`;
    const result = await SQL.query<Repository.FetchResult[]>(query, [invId]);
    if (!result) {
      this.logger.error(`Failed to load items with id: ${invId}`);
      return [];
    }
    // json data -> js obj
    return result.map(x => this.resultToState(x));
  };

  public createItem = (state: Inventory.ItemState) => {
    const query = `INSERT INTO inventory_items (id, name, inventory, position, quality, hotkey, lastDecayTime, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = this.stateToParams(state);
    SQL.query(query, params);
  };

  public deleteItem = (id: string) => {
    const query = `DELETE FROM inventory_items WHERE id = ?`;
    SQL.query(query, [id]);
  };

  // I'm sorry god, please don't look at this monstrosity
  public updateItems = (itemStates: Inventory.ItemState[]) => {
    const amount = itemStates.length;
    let query = `INSERT INTO inventory_items (id, name, inventory, position, quality, hotkey, lastDecayTime, metadata) VALUES`;
    for (let i = 0; i < amount; i++) {
      query += ` (?, ?, ?, ?, ?, ?, ?, ?)`;
      if (i !== amount - 1) query += `,`;
    }
    query += ` ON DUPLICATE KEY UPDATE inventory = VALUES(inventory), position = VALUES(position), quality = VALUES(quality), hotkey = VALUES(hotkey), metadata = VALUES(metadata);`;
    const params = itemStates.reduce<Repository.UpdateParameters>(
      (acc, cur) => [...acc, ...this.stateToParams(cur)],
      []
    );
    SQL.query(query, params);
  };

  public deleteNonPersistent = async () => {
    const query = `DELETE FROM inventory_items WHERE inventory = 'nonpersistent' RETURNING id`;
    const result = await SQL.query(query);
    this.logger.info(`${result.length} items have been deleted because they were in a nonpersistent inventory`);
  };

  public getItemState = async (itemId: string) => {
    const query = `SELECT * FROM inventory_items WHERE id = ?`;
    const result = await SQL.scalar<Repository.FetchResult>(query, [itemId]);
    if (Object.keys(result).length === 0) return null;
    return this.resultToState(result);
  };
}

const repository = Repository.getInstance();
export default repository;
