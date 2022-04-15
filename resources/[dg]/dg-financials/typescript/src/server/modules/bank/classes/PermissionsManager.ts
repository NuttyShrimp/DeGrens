import winston from 'winston';
import { SQL } from '@ts-shared/server';

import { AccountPermissionValue } from '../../../sv_constant';
import { bankLogger } from '../utils';

export class PermissionsManager {
  private account_id: string;
  private members: IAccountMember[];
  private logger: winston.Logger;

  constructor(account_id: string, members: IAccountMember[]) {
    this.members = members;
    this.account_id = account_id;
    this.logger = bankLogger.child({
      module: `PermsManager - ${account_id}`,
    });
  }

  // region DB
  private async updatePermission(cid: number, access_level: number): Promise<void> {
    const query = `
			INSERT INTO bank_accounts_access
				(account_id, cid, access_level)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE access_level = ?
		`;
    await SQL.query(query, [this.account_id, cid, access_level, access_level]);
  }

  // endregion

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

  // region Util
  public buildPermissions(level: number): IAccountPermission {
    const permissions: IAccountPermission = {
      deposit: false,
      withdraw: false,
      transfer: false,
      transactions: false,
    };
    try {
      Object.keys(AccountPermissionValue).forEach(key => {
        if (level & AccountPermissionValue[key as keyof IAccountPermission]) {
          permissions[key as keyof IAccountPermission] = true;
        }
      });
    } catch (e) {
      this.logger.error(`Error building permissions for account ${this.account_id}`, e);
    }
    this.logger.debug(`buildPermissions | level: ${level} | permissions: ${JSON.stringify(permissions)}`);
    return permissions;
  }

  // endregion

  // region Getters
  public hasAccess(cid: number): boolean {
    const inArray = this.members.some(member => member.cid === cid);
    this.logger.debug(`hasAccess | cid: ${cid} | inArray: ${inArray}`);
    return inArray;
  }

  public getMemberLevel = (cid: number) => {
    const member = this.members.find(m => m.cid === cid);
    return member ? member.access_level : 0;
  };

  public hasPermission(cid: number, permission: AccountPermission): boolean {
    const member = this.members.find(member => member.cid === cid);
    if (!member) {
      this.logger.debug(`hasPermission: not in members array | cid: ${cid}`);
      return false;
    }
    const perms = this.buildPermissions(member.access_level);
    this.logger.info(`hasPermission | cid: ${cid} | ${permission}: ${perms[permission]}`);
    return perms[permission];
  }

  // endregion

  public addPermissions(cid: number, permissions: IAccountPermission | number): void {
    let accessLevel = 0;
    if (typeof permissions === 'number') {
      accessLevel = permissions;
    } else {
      for (const permission in permissions) {
        if (!permissions[permission as keyof IAccountPermission]) continue;
        accessLevel |= AccountPermissionValue[permission as keyof IAccountPermission];
      }
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
}
