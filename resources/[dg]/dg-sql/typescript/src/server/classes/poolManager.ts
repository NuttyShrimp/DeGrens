import { createPool, Pool } from 'mysql2/promise';
import { mainLogger } from '../sv_logger';
import { connectionOptions } from '../helpers/connection';

class PoolManager {
  private static instance: PoolManager;
  public static getInstance() {
    if (!this.instance) {
      this.instance = new PoolManager();
    }
    return this.instance;
  }

  private connectionConfig: Record<string, string>;
  private pool: Pool | null = null;

  constructor() {
    this.connectionConfig = connectionOptions;
  }

  private createPool = () => {
    if (!this.connectionConfig['host'] && !this.connectionConfig['uri']) {
      const error = new Error(
        'No connection string specified, please set the mysql_connection_string convar in your config'
      );
      mainLogger.error(error.message);
      throw error;
    }

    try {
      this.pool = createPool({
        connectTimeout: 10000,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true,
        namedPlaceholders: true,
        ...this.connectionConfig,
      });
      mainLogger.info('Database connection established');
      emit('sql:onReady');
    } catch (error) {
      mainLogger.error(`SQL Pool Error [${(error as any).code}]:\n${(error as any).message}`);
    }
  };

  reconnect() {
    this.pool = null;
    this.createPool();
  }

  getPool(): Pool {
    if (!this.pool) {
      this.createPool();
    }
    return this.pool!;
  }
}

const poolManager = PoolManager.getInstance();
export default poolManager;
