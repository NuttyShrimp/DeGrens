import { Financials, Phone, SQL, Util } from '@dgx/server';
import { dispatchBusinessPermissionsToClientCache } from 'services/business';
import { getBitmaskForPermissions, getPermissions, permissionsFromBitmask } from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

export class Business {
  private info: Business.Info;
  private roles: Business.Role[];
  private employees: Business.Employee[];
  logger: winston.Logger;

  constructor(pInfo: Business.Info) {
    this.info = pInfo;
    this.roles = [];
    this.employees = [];
    this.loadBusinessInfo();
    this.logger = mainLogger.child({ module: pInfo.label });
  }

  private getOwnerCid = () => {
    return this.employees.find(e => e.isOwner)?.citizenid;
  };

  private setEmployees(employees: Business.Employee[]) {
    employees.sort((e1, e2) => {
      if (e1.isOwner) return -1;
      if (e2.isOwner) return 1;
      const e1Role = this.roles.find(r => r.id === e1.role)!;
      const e2Role = this.roles.find(r => r.id === e2.role)!;
      const permDiff = e1Role.permissions - e2Role.permissions;
      if (!permDiff) {
        if (e1.name < e2.name) return -1;
        if (e1.name > e2.name) return 1;
      }
      return permDiff;
    });
    this.employees = employees;
  }

  private async loadBusinessInfo() {
    // Load roles
    this.roles = await SQL.query<Business.Role[]>(
      'SELECT id, name, permissions FROM business_role WHERE business_id = ?',
      [this.info.id]
    );
    const DBEmployees = await SQL.query<(Omit<Business.Employee, 'role'> & { role_id: number })[]>(
      `
        SELECT id, is_owner as isOwner, citizenid, role_id, CONCAT(firstname, ' ', lastname) as name
        FROM business_employee
               INNER JOIN character_info USING (citizenid)
        WHERE business_id = ?
      `,
      [this.info.id]
    );
    this.setEmployees(
      DBEmployees.map(e => {
        return {
          id: e.id,
          citizenid: e.citizenid,
          name: e.name,
          isOwner: e.isOwner,
          role: e.role_id,
          bank: Financials.getPermissions(this.info.bank_account_id, e.citizenid),
        };
      })
    );

    DBEmployees.forEach(e => {
      dispatchBusinessPermissionsToClientCache(e.citizenid, 'add', this.info.name);
    });
  }

  // Check if an array of perissions doesn't include
  // non-assignable permissions within this business
  private arePermissionsValid(perms: string[]) {
    return perms.every(p => this.info.business_type.permissions.includes(p));
  }

  // msg should be constructed as NameFrmCID did ${msg}
  private logAction(cid: number, actionType: string, msg: string) {
    return SQL.insert(
      `INSERT INTO business_log (citizenid, business_id, type, action)
       VALUES (?, ?, ?, ?)`,
      [cid, this.info.id, actionType, msg]
    );
  }

  getInfo() {
    return this.info;
  }

  getPermissions() {
    return [...this.info.business_type.permissions];
  }

  getEmployees() {
    return this.employees.map(e => ({
      ...e,
      role: this.roles.find(r => r.id === e.role)?.name ?? 'Unknown role',
    }));
  }

  getRoles(): Record<string, string[]> {
    return this.roles
      .sort((r1, r2) => r2.permissions - r1.permissions)
      .reduce<Record<string, string[]>>((roles, role) => {
        roles[role.name] = permissionsFromBitmask(role.permissions);
        return roles;
      }, {});
  }

  isEmployee(cid: number) {
    return this.employees.find(e => e.citizenid === cid);
  }

  hasPermission(cid: number, permission: string) {
    const employee = this.employees.find(e => e.citizenid === cid);
    if (!employee) return false;
    const permissions = getPermissions();
    if (!permissions[permission]) return false;
    if (employee.isOwner) return true;
    const role = this.roles.find(r => employee.role === r.id);
    if (!role) return false;
    return role.permissions & permissions[permission];
  }

  getClientInfo(cid: number): undefined | Business.UI.Business {
    if (!this.isEmployee(cid)) return;
    const employee = this.employees.find(e => e.citizenid === cid);
    if (!employee) return;
    const role = this.roles.find(r => r.id === employee.role);
    if (!role) return;
    return {
      id: this.info.id,
      name: this.info.name,
      label: this.info.label,
      role: employee.isOwner ? 'CEO' : role.name,
      permissions: employee.isOwner ? this.info.business_type.permissions : permissionsFromBitmask(role.permissions),
      allPermissions: this.info.business_type.permissions,
    };
  }

  async getLogs(offset: number): Promise<Business.UI.Log[]> {
    return await SQL.query<Business.UI.Log[]>(
      `SELECT id, business_id, type, action, CONCAT(firstname, ' ', lastname) as name
       FROM business_log
              JOIN character_info USING (citizenid)
       WHERE business_id = ?
       LIMIT 30 OFFSET ?`,
      [this.info.id, 30 * offset]
    );
  }

  async updateOwner(targetCID: number) {
    this.logger.info(`Updated business owner to ${targetCID}`)
    this.setEmployees(this.employees.map(e => ({...e, isOwner: e.citizenid === targetCID})))
  }

  async hire(src: number, targetCID: number, roleName: string) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'hire')) {
      Util.Log(
        'business:hire:missingPermission',
        {
          targetCID,
          role: roleName,
        },
        `${Util.getName(src)} tried to hire ${targetCID} for ${this.info.label} but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    if (this.employees.find(e => e.citizenid === targetCID)) throw new Error('Already hired');
    const target = await DGCore.Functions.GetOfflinePlayerByCitizenId(targetCID);
    if (!target) throw new Error('Invalid CID');
    const roleId = this.roles.find(r => r.name === roleName)?.id;
    if (!roleId) throw new Error('Invalid role');

    const employeeId = await SQL.insert(
      'INSERT INTO business_employee (citizenid, role_id, business_id) VALUES (?, ?, ?)',
      [targetCID, roleId, this.info.id]
    );
    if (!employeeId) throw new Error('Failed to save');
    const employeeName = `${target.PlayerData.charinfo.firstname} ${target.PlayerData.charinfo.lastname}`;
    this.setEmployees([
      ...this.employees,
      {
        id: employeeId,
        name: employeeName,
        citizenid: targetCID,
        role: roleId,
        isOwner: false,
        bank: Financials.getPermissions(this.info.bank_account_id, targetCID),
      },
    ]);
    Util.Log(
      'business:hire',
      {
        targetCID,
        role: roleName,
        id: employeeId,
      },
      `${Util.getName(src)} hired ${targetCID} for ${this.info.label} with role: ${roleName}`,
      src
    );
    this.logAction(cid, 'hire', `${await Util.getCharName(targetCID)}(${targetCID}) aangenomen onder ${roleName}`);
    dispatchBusinessPermissionsToClientCache(targetCID, 'add', this.info.name);
    return employeeName;
  }

  async fire(src: number, targetCID: number) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'fire')) {
      Util.Log(
        'business:fire:missingPermission',
        {
          targetCID,
        },
        `${Util.getName(src)} tried to fire ${targetCID} for ${this.info.label} but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    const employee = this.employees.find(e => e.citizenid === targetCID);
    if (!employee) throw new Error('Not employed');
    if (employee.isOwner) throw new Error('Cannot fire the owner');
    await Financials.removePermissions(this.info.bank_account_id, targetCID);
    await SQL.query('DELETE FROM business_employee WHERE id = ? AND business_id = ?', [employee.id, this.info.id]);
    this.setEmployees(this.employees.filter(e => e.id !== employee.id));
    Util.Log(
      'business:fire',
      {
        targetCID,
      },
      `${Util.getName(src)} fired ${targetCID} for ${this.info.label}`,
      src
    );
    this.logAction(cid, 'fire', `${await Util.getCharName(targetCID)}(${targetCID}) ontslagen`);
    dispatchBusinessPermissionsToClientCache(targetCID, 'remove', this.info.name);
  }

  async changeBankPermission(src: number, targetCID: number, permissions: IFinancials.Permissions) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'change_bank_perms')) {
      Util.Log(
        'business:changeBankPermission:missingPermission',
        {
          targetCID,
          permissions,
        },
        `${Util.getName(src)} tried to update the bank access for ${targetCID} for ${
          this.info.label
        } but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    const employee = this.employees.find(e => e.citizenid === targetCID);
    if (!employee) throw new Error('Not employed');
    await Financials.setPermissions(this.info.bank_account_id, targetCID, permissions);
    employee.bank = permissions;
    Util.Log(
      'business:changeBankPermission',
      {
        targetCID,
        permissions,
      },
      `${Util.getName(src)} changed ${targetCID} bank's permissions for ${this.info.label}`,
      src
    );
    this.logAction(
      cid,
      'bankPerms',
      `${await Util.getCharName(targetCID)}(${targetCID}) zijn bank permissies aangepast`
    );
  }

  async assignRole(src: number, targetCID: number, roleName: string) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'hire')) {
      Util.Log(
        'business:assignRole:missingPermission',
        {
          targetCID,
        },
        `${Util.getName(src)} tried to assign ${roleName} to ${targetCID} for ${
          this.info.label
        } but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    const employeeId = this.employees.find(e => e.citizenid === targetCID)?.id;
    if (!employeeId) throw new Error('Not employed');
    const role = this.roles.find(r => r.name === roleName);
    if (!role) throw new Error('Invalid role');
    await SQL.query('UPDATE business_employee SET role_id = ? WHERE id = ? AND business_id = ?', [
      role.id,
      employeeId,
      this.info.id,
    ]);
    this.setEmployees(
      this.employees.map(e => {
        if (e.citizenid === targetCID) {
          e.role = role.id;
        }
        return e;
      })
    );
    Util.Log(
      'business:assignRole',
      {
        targetCID,
      },
      `${Util.getName(src)} assigned ${targetCID} to ${roleName} for ${this.info.label}`,
      src
    );
    this.logAction(
      cid,
      'role',
      `${await Util.getCharName(targetCID)}(${targetCID}) zijn rol aangepast naar ${roleName}`
    );
    dispatchBusinessPermissionsToClientCache(targetCID, 'add', this.info.name);
  }

  async createRole(src: number, name: string, permissions: string[]) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'change_role')) {
      Util.Log(
        'business:createRole:missingPermission',
        {
          permissions,
          name,
        },
        `${Util.getName(src)} tried to create a new business role for ${
          this.info.label
        } but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    if (!this.arePermissionsValid(permissions)) {
      Util.Log(
        'business:createRole:invalidPermissions',
        {
          permissions,
          allowedPermissions: this.info.business_type.permissions,
          name,
        },
        `${Util.getName(src)} tried to create a new business role for ${this.info.label} with invalid permissions`,
        src
      );
      throw new Error('Invalid permissions');
    }
    const roleBitmask = getBitmaskForPermissions(permissions);
    if (this.roles.find(r => r.name === name)) throw new Error('Role with name already exists');
    const roleId = await SQL.insert('INSERT INTO business_role (name, permissions, business_id) VALUES (?,?,?)', [
      name,
      roleBitmask,
      this.info.id,
    ]);
    if (!roleId) throw new Error('Failed to saved role');
    this.roles.push({
      id: roleId,
      name,
      permissions: roleBitmask,
    });
    Util.Log(
      'business:createRole',
      {
        name,
        permissions,
        roleId,
      },
      `${Util.getName(src)} created a new role for ${this.info.label} named ${name}`,
      src
    );
    this.logAction(cid, 'role', `de ${name} rol aangemaakt`);
  }

  // TODO: add ability to change role name
  async updateRole(src: number, name: string, permissions: Record<string, boolean>) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'change_role')) {
      Util.Log(
        'business:updateRole:missingPermission',
        {
          permissions,
          name,
        },
        `${Util.getName(src)} tried to update a business role for ${
          this.info.label
        } but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    if (!this.arePermissionsValid(Object.keys(permissions))) {
      Util.Log(
        'business:updateRole:invalidPermissions',
        {
          permissions,
          allowedPermissions: this.info.business_type.permissions,
          name,
        },
        `${Util.getName(src)} tried to update a business role for ${this.info.label} with invalid permissions`,
        src
      );
      throw new Error('Invalid permissions');
    }
    const roleIdx = this.roles.findIndex(r => r.name === name);
    if (roleIdx === -1) throw new Error('Role not found');
    const role = this.roles[roleIdx];
    const untouchedPerms = permissionsFromBitmask(role.permissions).filter(p => !Object.keys(permissions).includes(p));
    const newPerms = Object.keys(permissions)
      .filter(p => permissions[p])
      .concat(untouchedPerms);
    const roleBitmask = getBitmaskForPermissions(newPerms);
    if (roleBitmask !== this.roles[roleIdx].permissions) {
      await SQL.query('UPDATE business_role SET permissions = ? WHERE name = ? AND business_id = ?', [
        roleBitmask,
        name,
        this.info.id,
      ]);
      this.roles[roleIdx].permissions = roleBitmask;
    }
    Util.Log(
      'business:updateRole',
      {
        name,
        permissions,
      },
      `${Util.getName(src)} update the ${name} role for ${this.info.label}`,
      src
    );
    this.logAction(cid, 'role', `de ${name} rol aangepast`);
    this.employees.forEach(e => {
      dispatchBusinessPermissionsToClientCache(e.citizenid, 'add', this.info.name);
    });
    return newPerms;
  }

  async deleteRole(src: number, name: string) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'change_role')) {
      Util.Log(
        'business:deleteRole:missingPermission',
        {
          permissions: getPermissions(),
          name,
        },
        `${Util.getName(src)} tried to delete a business role for ${
          this.info.label
        } but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    const roleId = this.roles.find(r => r.name === name)?.id;
    if (!roleId) throw new Error('Role not found');
    if (this.employees.find(e => e.role === roleId)) throw new Error('Role is still assigned');
    this.roles.filter(r => r.name !== name);
    await SQL.query('DELETE FROM business_role WHERE name = ? AND business_id = ?', [name, this.info.id]);
    Util.Log(
      'business:deleteRole',
      {
        name,
      },
      `${Util.getName(src)} deleted the ${name} role for ${this.info.label}`,
      src
    );
    this.logAction(cid, 'role', `de ${name} rol verwijderd`);
  }

  async payEmployee(src: number, targetCID: number, price: number, comment: string) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'pay_employee')) {
      Util.Log(
        'business:payEmployee:missingPermission',
        {
          targetCID,
          price,
          comment,
        },
        `${Util.getName(src)} tried pay ${targetCID} from ${this.info.label} but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    const employee = this.employees.find(e => e.citizenid === targetCID);
    if (!employee) throw new Error(`${targetCID} is not hired`);
    const employeeAccId = Financials.getDefaultAccountId(employee.citizenid);
    if (!employeeAccId) throw new Error(`Could not get default id of ${targetCID}`);
    const ownerCid = this.getOwnerCid();
    if (!ownerCid) throw new Error(`Could not get owner of business`);
    const success = await Financials.transfer(
      this.info.bank_account_id,
      employeeAccId,
      ownerCid,
      employee.citizenid,
      price,
      comment
    );
    Util.Log(
      `business:payEmployee:${success ? 'success' : 'failed'}`,
      {
        targetCID,
        price,
        comment,
      },
      `${Util.getName(src)} payed ${employee.citizenid} as employee ${price} from ${this.info.label}'s bank account'`,
      src
    );
    return success;
  }

  async payExtern(src: number, targetCID: number, price: number, comment: string) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'pay_external')) {
      Util.Log(
        'business:payExtern:missingPermission',
        {
          targetCID,
          price,
          comment,
        },
        `${Util.getName(src)} tried pay ${targetCID} (Extern) from ${
          this.info.label
        } but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    const externAccId = Financials.getDefaultAccountId(targetCID);
    if (!externAccId) throw new Error(`Could not get default account of ${targetCID}`);
    const ownerCid = this.getOwnerCid();
    if (!ownerCid) throw new Error(`Could not get owner of business`);
    const success = await Financials.transfer(
      this.info.bank_account_id,
      externAccId,
      ownerCid,
      targetCID,
      price,
      comment
    );
    Util.Log(
      `business:payExtern:${success ? 'success' : 'failed'}`,
      {
        targetCID,
        price,
        comment,
      },
      `${Util.getName(src)} payed ${targetCID} as extern ${price} from ${this.info.label}'s bank account`,
      src
    );
    return success;
  }

  private async chargePhoneHelper(
    src: number,
    targetSource: number,
    targetCID: number,
    price: number,
    comment: string
  ) {
    const cid = Util.getCID(src);
    const hasAccepted = await Phone.notificationRequest(targetSource, {
      icon: {
        name: 'euro-sign',
        color: 'white',
        background: '#118C4F',
      },
      title: 'Inkomend betaalverzoek',
      description: `€${price} - ${this.info.label}`,
      id: `${this.info.id}-${src}-${targetCID}-${price}-${Date.now()}`,
    });
    if (!hasAccepted) {
      Phone.showNotification(src, {
        icon: {
          name: 'euro-sign',
          color: 'white',
          background: '#118C4F',
        },
        title: 'Betaalverzoek geweigerd',
        description: `${targetCID} - €${price} - ${this.info.label}`,
        id: `${this.info.id}-${src}-${targetCID}-${price}-${Date.now()}`,
      });
      Util.Log(
        `business:chargeExtern:rejected`,
        {
          targetCID,
          price,
          comment,
        },
        `${Util.getName(src)} requested charge to ${targetCID} as extern for ${price} to ${
          this.info.label
        }'s bank account was rejected`,
        src
      );
      return;
    }

    const externAccId = Financials.getDefaultAccountId(targetCID);
    if (!externAccId) throw new Error(`Could not get default account of ${targetCID}`);
    const ownerCid = this.getOwnerCid();
    if (!ownerCid) throw new Error(`Could not get owner of business`);
    const success = await Financials.transfer(
      externAccId,
      this.info.bank_account_id,
      targetCID,
      ownerCid,
      price,
      comment
    );
    Util.Log(
      `business:payExtern:${success ? 'success' : 'failed'}`,
      {
        targetCID,
        price,
        comment,
      },
      `${Util.getName(src)} payed ${targetCID} as extern ${price} from ${this.info.label}'s bank account`,
      src
    );
    Phone.showNotification(
      src,
      success
        ? {
            id: `chargeExtern-${this.info.id}-${src}-${targetCID}-${price}-${Date.now()}`,
            app: 'business',
            title: 'Betaalverzoek geaccepteerd',
            description: `${targetCID} heeft €${price} betaald`,
            icon: 'business',
          }
        : {
            id: `chargeExtern-${this.info.id}-${src}-${targetCID}-${price}-${Date.now()}`,
            app: 'business',
            title: 'Betaalverzoek afkeured',
            description: `${targetCID} - €${price}`,
            icon: 'business',
          }
    );
  }

  async chargeExtern(src: number, targetCID: number, price: number, comment: string) {
    const cid = Util.getCID(src);
    if (!this.hasPermission(cid, 'charge_external')) {
      Util.Log(
        'business:chargeExtern:missingPermission',
        {
          targetCID,
          price,
          comment,
        },
        `${Util.getName(src)} tried charge ${targetCID} (Extern) for ${
          this.info.label
        } but doesn't have the right permission`,
        src
      );
      throw new Error('Missing permissions');
    }
    targetCID = Number(targetCID);

    const targetServerId = DGCore.Functions.getPlyIdForCid(targetCID);
    if (!targetServerId) throw new Error(`${targetCID} is an invalid CID`);

    this.chargePhoneHelper(src, targetServerId, targetCID, price, comment);
    return true;
  }
}
