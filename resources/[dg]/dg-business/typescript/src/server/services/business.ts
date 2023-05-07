import { Core, Events, Financials, SQL, Util } from '@dgx/server';
import { Business } from 'classes/Business';
import { getBitmaskForPermissions, getConfig } from './config';
import { mainLogger } from '../sv_logger';
import { charModule } from './core';

let businesses: Map<number, Business> = new Map();
let businessTypes: Map<number, Business.Type> = new Map();
let businessesLoaded = false;

export const areBusinessesLoaded = () => businessesLoaded;
export const awaitBusinessesLoaded = () => Util.awaitCondition(() => businessesLoaded, 600000);

export const seedBusinessTypes = async () => {
  const config = getConfig();
  let bTypes = await SQL.query<{ name: string; id: number }[]>('SELECT name, id FROM business_type');
  const bTypesToInsert = Object.keys(config.types)
    .filter(type => !bTypes.some(t => t.name === type))
    .map(type => ({ name: type }));
  if (bTypesToInsert.length > 0) {
    await SQL.insertValues('business_type', bTypesToInsert);
    const newBTypes = await SQL.query<{ name: string; id: number }[]>(
      'SELECT name, id FROM business_type WHERE name IN (?)',
      [bTypesToInsert.map(x => x.name).join(',')]
    );
    bTypes = bTypes.concat(newBTypes);
  }
  const basePermissions = Object.keys(config.permissions.base);
  bTypes.forEach(bt => {
    const typePermissions = config.types[bt.name]?.permissions ?? [];
    const bType: Business.Type = {
      id: bt.id,
      name: bt.name,
      permissions: [
        ...basePermissions,
        ...typePermissions.sort((p1, p2) => {
          const p1Mask = config.permissions.extra?.[p1] ?? 0;
          const p2Mask = config.permissions.extra?.[p2] ?? 0;
          return p1Mask - p2Mask;
        }),
      ],
    };
    mainLogger.debug(`Loaded business type: ${bType.name}`);
    businessTypes.set(bt.id, bType);
  });
};

export const seedBusinesses = async () => {
  const DBBusinesses = await SQL.query<(Business.Info & { business_type: number })[]>(
    'SELECT id, name, label, business_type, bank_account_id FROM business'
  );
  await Promise.all(
    DBBusinesses.map(async bInfo => {
      const business = new Business({
        ...bInfo,
        business_type: businessTypes.get(bInfo.business_type)!,
      });
      await business.loadBusinessInfo();
      mainLogger.info(`Loaded business: ${bInfo.label} (${bInfo.id})`);
      businesses.set(bInfo.id, business);
    })
  );

  businessesLoaded = true;
};

const findBusinessTypeByName = (name: string) => {
  for (const bType of businessTypes.values()) {
    if (bType.name === name) {
      return bType;
    }
  }
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
  await business.loadBusinessInfo(true);
  businesses.set(businessId, business);
};

export const deleteBusiness = (id: number) => {
  const business = businesses.get(id);
  if (!business) return;
  const charModule = Core.getModule('characters');
  business.getEmployees().forEach(e => {
    dispatchBusinessPermissionsToClientCache(e.citizenid, 'remove', id);
  });
  businesses.delete(id);
};

export const getBusinessById = (id: number) => {
  return businesses.get(id);
};

export const getBusinessByName = (name: string): Business | null => {
  let business: Business | null = null;
  for (const [_, b] of businesses) {
    if (b.getInfo().name === name) {
      business = b;
      break;
    }
  }
  return business;
};

export const getBusinessesForPlayer = (src: number) => {
  const cid = Util.getCID(src);
  const plyBusinesses: Business.UI.Business[] = [];
  businesses.forEach(business => {
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
 */
export const dispatchBusinessPermissionsToClientCache = (cid: number, action: 'add' | 'remove', businessId: number) => {
  const plyId = charModule.getServerIdFromCitizenId(cid);
  if (!plyId) return;
  const business = getBusinessById(businessId);
  if (!business) return;
  const permissions = business.getClientInfo(cid)?.permissions ?? [];
  Events.emitNet('business:client:updateCache', plyId, action, business.getInfo().name, permissions);
};

/**
 * Dispatch all permissions for the businesses player has access to to player
 */
export const dispatchAllBusinessPermissionsToClientCache = (plyId: number) => {
  const businesses = getBusinessesForPlayer(plyId).map(b => ({ name: b.name, permissions: b.permissions }));
  Events.emitNet('business:client:setCache', plyId, businesses);
};

export const getAllBusinessesInfo = () => {
  const businessesInfo: Record<string, Business.Info> = {};
  for (const [_, business] of businesses) {
    const info = business.getInfo();
    businessesInfo[info.name] = info;
  }
  return businessesInfo;
};

export const getBusinessPlayerIsInsideOf = (plyId: number) => {
  for (const [_, business] of businesses) {
    if (business.isPlayerInside(plyId)) {
      return business;
    }
  }
};

export const getSignedInPlayersForBusinessType = (businessType: string) => {
  const plys = new Set<number>();
  for (const [_, business] of businesses) {
    if (business.getInfo().business_type.name !== businessType) continue;
    business.getSignedInPlayers().forEach(p => plys.add(p));
  }
  return [...plys];
};

export const isPlayerSignedInAtAnyOfBusinessType = (plyId: number, businessType: string) => {
  for (const [_, business] of businesses) {
    if (business.getInfo().business_type.name === businessType && business.isSignedIn(plyId)) {
      return true;
    }
  }
  return false;
};

export const leaveCurrentBusiness = (plyId: number) => {
  const business = getBusinessPlayerIsInsideOf(plyId);
  if (!business) return;
  business.playerLeft(plyId);
};
