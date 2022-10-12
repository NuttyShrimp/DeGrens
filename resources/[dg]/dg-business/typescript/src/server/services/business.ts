import { Events, Financials, SQL, Util } from '@dgx/server';
import { Business } from 'classes/Business';
import { config, getBitmaskForPermissions } from './config';
import { mainLogger } from '../sv_logger';

let businesses: Map<number, Business> = new Map();
let businessTypes: Map<number, Business.Type> = new Map();

export const seedBusinessTypes = async () => {
  let bTypes = await SQL.query<{ name: string; id: number }[]>('SELECT name, id FROM business_type');
  const bTypesToInsert = Object.keys(config.types)
    .filter(type => !Object.values(bTypes).find(et => et.name === type))
    .map(type => ({ name: type }));
  if (bTypesToInsert.length > 0) {
    await SQL.insertValues('business_type', bTypesToInsert);
    const newBTypes = await SQL.query<{ name: string; id: number }[]>(
      'SELECT name, id FROM business_type WHERE name IN (?)',
      [bTypesToInsert.join(',')]
    );
    bTypes = bTypes.concat(newBTypes);
  }
  bTypes.forEach(bt => {
    const bType: Business.Type = {
      id: bt.id,
      name: bt.name,
      permissions: Object.keys(config.permissions.base).concat(
        config.types[bt.name].sort((p1, p2) => {
          const p1Mask = config.permissions.extra?.[p1] ?? 0;
          const p2Mask = config.permissions.extra?.[p2] ?? 0;
          return p1Mask - p2Mask;
        })
      ),
    };
    mainLogger.debug(`Loaded business type: ${bType.name}`);
    businessTypes.set(bt.id, bType);
  });
  seedBusinesses();
};

const seedBusinesses = async () => {
  const DBBusinesses = await SQL.query<(Business.Info & { business_type: number })[]>(
    'SELECT id, name, label, business_type, bank_account_id FROM business'
  );
  DBBusinesses.forEach(bInfo => {
    const business = new Business({
      ...bInfo,
      business_type: businessTypes.get(bInfo.business_type)!,
    });
    mainLogger.debug(`Loaded business: ${bInfo.label} (${bInfo.id}`);
    businesses.set(bInfo.id, business);
  });
};

const findBusinessTypeByName = (pType: string) => {
  for (const typeId of businessTypes.keys()) {
    if (businessTypes.get(typeId)?.name === pType) {
      return businessTypes.get(typeId);
    }
  }
  return null;
};

export const createBusiness = async (name: string, label: string, owner: number, bTypeName: string) => {
  const bType = findBusinessTypeByName(bTypeName);
  if (!bType) {
    Util.Log(
      'business:create:failed',
      {
        label,
        owner,
        bTypeName,
      },
      `Failed to create business with invalid type ${bTypeName}`,
      undefined,
      true
    );
    mainLogger.error(
      `Failed to create business because the type was invalid/undefined | label: ${label} | owner: ${owner} | type: ${bTypeName}`
    );
    return;
  }

  const accountId = await Financials.createAccount(owner, label, 'business');
  if (!accountId) {
    Util.Log(
      'business:create:failed',
      {
        name,
        label,
        owner,
        bTypeName,
      },
      `Failed to create business bank account for ${label}`,
      undefined,
      true
    );
    mainLogger.error(
      `Failed to create business because no bank account was created | label: ${label} | owner: ${owner} | type: ${bTypeName}`
    );
    return;
  }
  const businessId = await SQL.insert(
    `INSERT INTO business (name, label, business_type, bank_account_id)
     VALUES (?, ?, ?, ?)`,
    [name, label, bType.id, accountId]
  );
  if (!businessId) {
    Util.Log(
      'business:create:failed',
      {
        label,
        owner,
        name,
        bTypeName,
      },
      `Failed to save business ${label} in database`,
      undefined,
      true
    );
    mainLogger.error(
      `Failed to create business because it could not be saved in the DB | label: ${label} | owner: ${owner} | type: ${bTypeName}`
    );
    return;
  }
  const roleId = await SQL.insert('INSERT INTO business_role (name, permissions, business_id) VALUES (?, ?, ?)', [
    'CEO',
    getBitmaskForPermissions(bType.permissions),
    businessId,
  ]);
  await SQL.query(
    `INSERT INTO business_employee (citizenid, role_id, business_id, is_owner)
     VALUES (?, ?, ?, 1)`,
    [owner, roleId, businessId]
  );
  const business = new Business({
    id: businessId,
    name,
    business_type: bType,
    label,
    bank_account_id: accountId,
  });
  businesses.set(businessId, business);
};

export const getBusinessById = (id: number) => {
  return businesses.get(id);
};

export const getBusinessByName = (name: string): Business | null => {
  let business: Business | null = null;
  businesses.forEach(b => {
    if (b.getInfo().name === name) {
      business = b;
    }
  });
  return business;
};

export const getBusinessesForPlayer = (src: number) => {
  const cid = Util.getCID(src);
  const plyBusinesses: Business.UI.Business[] = [];
  businesses.forEach(business => {
    if (!business.isEmployee(cid)) return;
    const businessInfo = business.getClientInfo(cid);
    if (!businessInfo) return;
    plyBusinesses.push(businessInfo);
  });
  return plyBusinesses;
};

export const getBusinessEmployees = (id: number): Business.UI.Employee[] => {
  const business = businesses.get(id);
  if (!business) return [];
  const employees = business.getEmployees();
  return employees.map(e => {
    const UIEmployee: Business.UI.Employee & { id?: number } = { ...e };
    delete UIEmployee.id;
    return UIEmployee;
  });
};

/**
 * Dispatch player permissions for specific business to client
 * @param cid Player CID (gets checked if online)
 * @param action Wether to add or remove permissions of this business to/from client
 * @param name Business Name
 */
export const dispatchBusinessPermissionsToClientCache = (cid: number, action: 'add' | 'remove', name: string) => {
  const plyId = DGCore.Functions.GetPlayerByCitizenId(cid)?.PlayerData?.source;
  if (plyId === undefined) return;
  const business = getBusinessByName(name);
  if (!business) return;
  const permissions = business.getClientInfo(cid)?.permissions;
  if (!permissions) return;
  Events.emitNet('business:client:updateCache', plyId, action, name, permissions);
};

/**
 * Dispatch all permissions for the businesses player has access to to player
 */
export const dispatchAllBusinessPermissionsToClientCache = (plyId: number) => {
  Events.emitNet(
    'business:client:setCache',
    plyId,
    getBusinessesForPlayer(source).map(b => ({ name: b.name, permissions: b.permissions }))
  );
};
