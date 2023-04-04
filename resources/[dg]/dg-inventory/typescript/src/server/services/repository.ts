import { SQL, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

class Repository extends Util.Singleton<Repository>() {
  private logger: winston.Logger;

  private queuedQueries: { query: string; params: Repository.UpdateParameters }[];
  private queuedQueryExecuting: boolean;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Repository' });
    this.queuedQueries = [];
    this.queuedQueryExecuting = false;
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

  // Does not need to be queued, only gets used on inv load at which point no item in that inventory could have been modified
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

  public deleteItem = (id: string) => {
    const query = `DELETE FROM inventory_items WHERE id = ?`;
    this.addQueryToQueue(query, [id]);
  };

  public updateItems = (itemStates: Inventory.ItemState[]) => {
    const amount = itemStates.length;
    const params: Repository.UpdateParameters = [];

    let query = `INSERT INTO inventory_items (id, name, inventory, position, rotated, hotkey, metadata, destroyDate) VALUES`;
    for (let i = 0; i < amount; i++) {
      params.push(...this.stateToParams(itemStates[i]));

      query += ` (?, ?, ?, ?, ?, ?, ?, ?)`;
      if (i !== amount - 1) query += `,`;
    }
    query += ` ON DUPLICATE KEY UPDATE inventory = VALUES(inventory), position = VALUES(position), rotated = VALUES(rotated), hotkey = VALUES(hotkey), metadata = VALUES(metadata), destroyDate = VALUES(destroyDate);`;

    this.addQueryToQueue(query, params);
  };

  // Does not need to be queued, only gets used on server start and gets awaited
  public deleteNonPersistent = async () => {
    const query = `DELETE FROM inventory_items WHERE inventory = 'nonpersistent' RETURNING id`;
    const result: unknown[] = await SQL.query(query);
    if (result.length === 0) return;
    Util.Log(
      'inventory:deleteNonPersistent',
      { items: result },
      `${result.length} items have been deleted because they were in a nonpersistent inventory`
    );
    this.logger.info(`${result.length} items have been deleted because they were in a nonpersistent inventory`);
  };

  // Function to be used by other resources
  public getItemState = async (itemId: string) => {
    const query = `SELECT * FROM inventory_items WHERE id = ?`;
    const result = await SQL.scalar<Repository.FetchResult>(query, [itemId]);
    if (Object.keys(result).length === 0) return null;
    return this.resultToState(result);
  };

  // Does not need to be queued, only gets used on server start and gets awaited
  public deleteByDestroyDate = async () => {
    const currentMinutes = Math.floor(Date.now() / (1000 * 60));
    const query = `DELETE FROM inventory_items WHERE destroyDate < ? RETURNING id`;
    const result: unknown[] = await SQL.query(query, [currentMinutes]);
    if (result.length === 0) return;

    Util.Log(
      'inventory:deleteByDestroyDate',
      { items: result },
      `${result.length} items have been deleted because their destroydate has passed`
    );
    this.logger.info(`${result.length} items have been deleted because their destroydate has passed`);
  };

  private addQueryToQueue = (query: string, params: Repository.UpdateParameters) => {
    this.queuedQueries.push({ query, params });
    this.executeQeueudQuery();
  };

  private executeQeueudQuery = async () => {
    if (this.queuedQueryExecuting) return;
    this.queuedQueryExecuting = true;

    const queuedQuery = this.queuedQueries.shift();
    if (!queuedQuery) {
      this.queuedQueryExecuting = false;
      return;
    }

    this.logger.debug(`Executing query`);
    await SQL.query(queuedQuery.query, queuedQuery.params);
    this.queuedQueryExecuting = false;

    this.executeQeueudQuery();
  };
}

const repository = Repository.getInstance();
export default repository;
