import { SQL, Util } from '@dgx/server';
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
      state.rotated ? 1 : 0,
      state.hotkey,
      JSON.stringify(state.metadata),
      state.destroyDate,
    ];
  };

  private resultToState = (state: Repository.FetchResult): Inventory.ItemState => {
    return {
      ...state,
      rotated: state.rotated === 1,
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
    const query = `INSERT INTO inventory_items (id, name, inventory, position, rotated, hotkey, metadata, destroyDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = this.stateToParams(state);
    SQL.query(query, params);
  };

  public deleteItem = (id: string) => {
    const query = `DELETE FROM inventory_items WHERE id = ?`;
    SQL.query(query, [id]);
  };

  public updateItems = (itemStates: Inventory.ItemState[]) => {
    const amount = itemStates.length;
    let query = `INSERT INTO inventory_items (id, name, inventory, position, rotated, hotkey, metadata, destroyDate) VALUES`;
    for (let i = 0; i < amount; i++) {
      query += ` (?, ?, ?, ?, ?, ?, ?, ?)`;
      if (i !== amount - 1) query += `,`;
    }
    query += ` ON DUPLICATE KEY UPDATE inventory = VALUES(inventory), position = VALUES(position), rotated = VALUES(rotated), hotkey = VALUES(hotkey), metadata = VALUES(metadata), destroyDate = VALUES(destroyDate);`;
    const params = itemStates.reduce<Repository.UpdateParameters>(
      (acc, cur) => [...acc, ...this.stateToParams(cur)],
      []
    );
    SQL.query(query, params);
  };

  public deleteNonPersistent = async () => {
    const query = `DELETE FROM inventory_items WHERE inventory = 'nonpersistent' RETURNING id`;
    const result: string[] = await SQL.query(query);
    Util.Log(
      'inventory:deleteNonPersistent',
      { items: result },
      `${result.length} items have been deleted because they were in a nonpersistent inventory`
    );
    this.logger.info(`${result.length} items have been deleted because they were in a nonpersistent inventory`);
  };

  public getItemState = async (itemId: string) => {
    const query = `SELECT * FROM inventory_items WHERE id = ?`;
    const result = await SQL.scalar<Repository.FetchResult>(query, [itemId]);
    if (Object.keys(result).length === 0) return null;
    return this.resultToState(result);
  };

  public deleteByDestroyDate = async () => {
    const currentMinutes = Math.floor(Date.now() / (1000 * 60));
    const query = `DELETE FROM inventory_items WHERE destroyDate < ? RETURNING id`;
    const result: string[] = await SQL.query(query, [currentMinutes]);
    Util.Log(
      'inventory:deleteByDestroyDate',
      { items: result },
      `${result.length} items have been deleted because their destroydate has passed`
    );
    this.logger.info(`${result.length} items have been deleted because their destroydate has passed`);
  };
}

const repository = Repository.getInstance();
export default repository;
