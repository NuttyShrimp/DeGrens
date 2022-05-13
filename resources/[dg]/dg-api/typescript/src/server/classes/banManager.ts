import { SQL, Util } from '@dgx/server';

class BanManager extends Util.Singleton<BanManager>() {
  private bannedIps: Set<string>;
  private permaBannedIps: Set<string>;

  constructor() {
    super();
    this.bannedIps = new Set();
    this.loadBans();
  }

  private async loadBans(): Promise<void> {
    const query = `SELECT ip FROM api_bans`;
    const results = await SQL.query(query);
    for (const result of results) {
      this.bannedIps.add(result.ip);
    }
  }

  isBanned(ip: string): boolean {
    return this.bannedIps.has(ip);
  }

  ban(ip: string): void {
    const query = `INSERT INTO api_bans (ip) VALUES (?)`;
    const params = [ip];
    SQL.query(query, params);
    this.bannedIps.add(ip);
  }
}

export const banManager = new BanManager();
