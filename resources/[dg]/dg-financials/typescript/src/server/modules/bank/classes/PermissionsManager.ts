import { SQL } from '@dgx/server';
import winston from 'winston';

import { AccountPermissionValue } from '../../../sv_constant';
import { bankLogger } from '../utils';
import accountManager from './AccountManager';
import { buildPermissions as buildPerms } from '../helpers/accounts';

export class PermissionsManager {
  private account_id: string;
  private members: IAccountMember[];
  private logger: winston.Logger;
  private readonly isSeededAccount: boolean;
  private cache: Map<number, IAccountPermission>;

  constructor(account_id: string, members: IAccountMember[]) {
    this.account_id = account_id;
    this.members = members;
    this.isSeededAccount = accountManager.getSeededAccountIds().some(aId => aId === account_id);
    this.cache = new Map();

    this.logger = bankLogger.child({
      module: `PermsManager - ${account_id}`,
    });
  }

  public async init(): Promise<void> {
    const query = `
      SELECT cid,
             access_level
      FROM bank_accounts_access
      WHERE account_id = ?
    `;
    const result: IAccountMember[] = await SQL.query(query, [this.account_id]);
    if (!result || !result.length) return;
    result.forEach(row => {
      // Check if the member is already in the members array
      const member = this.members.find(m => m.cid === row.cid);
      if (member) {
        member.access_level = row.access_level;
        return;
      }
      this.members.push({
        cid: row.cid,
        access_level: row.access_level,
      });
    });
  }

  private async updatePermission(cid: number, access_level: number): Promise<void> {
    const query = `
      INSERT INTO bank_accounts_access
        (account_id, cid, access_level)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE access_level = ?
    `;
    await SQL.query(query, [this.account_id, cid, access_level, access_level]);
    this.cache.delete(cid);
  }

  public buildPermissions(level: number): IAccountPermission {
    const permissions = buildPerms(level)
    this.logger.silly(`buildPermissions | level: ${level} | permissions: ${JSON.stringify(permissions)}`);
    return permissions;
  }

  public hasAccess(cid: number): boolean {
    const inArray = this.members.some(member => member.cid === cid);
    this.logger.debug(`hasAccess | cid: ${cid} | inArray: ${inArray}`);
    return inArray;
  }

  public getMemberLevel = (cid: number) => {
    const member = this.members.find(m => m.cid === cid);
    return member ? member.access_level : 0;
  };

  public getMemberPermissions = (cid: number) => {
    const permissions = this.cache.get(cid);
    if (permissions) return permissions;
    const level = this.getMemberLevel(cid);
    return this.buildPermissions(level);
  };

  public hasPermission(cid: number, permission: AccountPermission): boolean {
    if (this.isSeededAccount) return true;
    const member = this.members.find(member => member.cid === cid);
    if (!member) {
      this.logger.debug(`hasPermission: not in members array | cid: ${cid}`);
      return false;
    }
    let perms = this.cache.get(cid);
    if (!perms) {
      perms = this.buildPermissions(member.access_level);
    }
    this.logger.info(`hasPermission | cid: ${cid} | ${permission}: ${perms[permission]}`);
    return perms[permission];
  }

  getMembers(): IAccountMember[] {
    return this.members;
  }

  getAccountOwner() {
    return this.members.find(m => m.access_level & AccountPermissionValue.owner);
  }

  public addPermissions(cid: number, permissions: IAccountPermission | number): void {
    let accessLevel = 0;
    if (typeof permissions === 'number') {
      accessLevel = permissions;
    } else {
      accessLevel = this.buildAccessLevel(permissions);
    }
    // Check if the user already has access
    const member = this.members.find(member => member.cid === cid);
    this.updatePermission(cid, accessLevel);
    if (member) {
      this.logger.info(`addPermissions: update perms | cid: ${cid} | accessLevel: ${accessLevel}`);
      member.access_level = accessLevel;
      return;
    }
    this.logger.info(`addPermissions: adding perms | cid: ${cid} | accessLevel: ${accessLevel}`);
    this.members.push({
      cid,
      access_level: accessLevel,
    });
  }

  public removePermissions(cid: number): void {
    SQL.query(
      `DELETE
      FROM bank_accounts_access
      WHERE account_id = ?
      AND cid = ?`,
      [this.account_id, cid]
    );
    this.logger.info(`removePermissions: removing access | cid: ${cid}`);
    this.members = this.members.filter(m => m.cid !== cid);
    this.cache.delete(cid);
  }

  public buildAccessLevel = (perms: IAccountPermission): number => {
    let level = 0;
    for (const perm in perms) {
      if (!perms[perm as keyof IAccountPermission]) continue;
      level |= AccountPermissionValue[perm as keyof IAccountPermission];
    }
    return level;
  };
}
