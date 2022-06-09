import mysql from 'mysql2/promise';
import poolManager from './poolManager';
import { mainLogger } from '../sv_logger';

class Handler {
  private profileLimit: number;
  private isResourceReady = false;

  constructor() {
    this.profileLimit = GetConvarInt('mysql_slow_query_warning', 150);
  }

  private async resStartup() {
    const id = await new Promise<NodeJS.Timer>(res => {
      const resName = GetCurrentResourceName();
      const id = setInterval(() => {
        if (GetResourceState(resName) == 'started') res(id);
      }, 100);
    });
    clearInterval(id);
    this.isResourceReady = true;
  }

  query = async (
    query: string,
    params: any[] | Record<string, any> = [],
    resource: string = GetCurrentResourceName()
  ): Promise<any> => {
    try {
      if (Array.isArray(params)) {
        params = params.map(p => {
          if (p === undefined) return null;
          if (p === 'undefined') return null;
          return p;
        });
      } else {
        Object.keys(params).forEach((k: string) => {
          // @ts-ignore
          if (params[k] === undefined) params[k] = null;
          // @ts-ignore
          if (params[k] === 'undefined') params[k] = null;
        });
      }
      if (!this.isResourceReady) await this.resStartup();
      const startTime = process.hrtime.bigint();

      ScheduleResourceTick(GetCurrentResourceName());
      const [result] = await poolManager.getPool().execute(query, params);

      const endTime = process.hrtime.bigint();
      const timeMs = Number(endTime - startTime) / 1e6;
      mainLogger.log(
        this.profileLimit < timeMs ? 'warn' : 'debug',
        `[${resource}] Executed ${query
          .replace(/\n/g, ' ')
          .trim()
          .replace(/\s{2,}/g, ' ')} in ${timeMs}ms`
      );
      return result;
    } catch (e) {
      mainLogger.error(
        `[${resource}] ^1Error^7 while excuting query!\n${e.message}\nquery: ${query}\nvalues: ${JSON.stringify(
          params
        )}`
      );
    }
  };
}

const handler = new Handler();
export default handler;
