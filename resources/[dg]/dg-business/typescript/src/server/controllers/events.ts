import { Events, RPC, Util, Chat, Auth, Core } from '@dgx/server';
import { getConfig, setConfig } from '../services/config';
import {
  dispatchAllBusinessPermissionsToClientCache,
  getBusinessById,
  getBusinessEmployees,
  getAllBusinessesInfo,
  getBusinessesForPlayer,
  awaitBusinessesLoaded,
  getBusinessByName,
  leaveCurrentBusiness,
  createBusiness,
} from '../services/business';

onNet('dg-config:moduleLoaded', (module: string, data: Config.Config) => {
  if (module !== 'business') return;
  setConfig(data);
});

Auth.onAuth(async plyId => {
  await awaitBusinessesLoaded();

  const config = getConfig();
  Events.emitNet('business:client:setPermLabels', plyId, config.permissions.labels);
  Events.emitNet('business:client:loadBusinesses', plyId, config.businesses, config.types, getAllBusinessesInfo());

  // Only happens when restarting resource
  if (Player(plyId).state.isLoggedIn) {
    dispatchAllBusinessPermissionsToClientCache(plyId);
  }
});

Core.onPlayerLoaded(playerData => {
  if (!playerData.serverId) return;
  dispatchAllBusinessPermissionsToClientCache(playerData.serverId);
});

Core.onPlayerUnloaded(plyId => {
  leaveCurrentBusiness(plyId);
});

RPC.register('business:server:getAll', src => {
  return getBusinessesForPlayer(src);
});

RPC.register('business:server:getEmployees', (src, id: number) => {
  return getBusinessEmployees(id);
});

RPC.register('business:server:getRoles', (src, id: number) => {
  const business = getBusinessById(id);
  if (!business) return [];
  return business.getRoles();
});

RPC.register('business:server:updateEmployee', async (src, id: number, cid: number, role: string) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    await business.assignRole(src, cid, role);
    return true;
  } catch (e) {
    business.logger.error(`Failed to assign role to employee: ${e}`);
    return false;
  }
});

RPC.register('business:server:hire', async (src, id: number, cid: number, role: string) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    return await business.hire(src, cid, role);
  } catch (e) {
    business.logger.error(`Failed to hire ${src} -> ${cid}: ${e}`);
    return false;
  }
});

RPC.register('business:server:fire', async (src, id: number, cid: number) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    await business.fire(src, cid);
    return true;
  } catch (e) {
    business.logger.error(`Failed to fire ${src} -> ${cid}: ${e}`);
    return false;
  }
});

RPC.register('business:server:payEmployee', async (src, id: number, cid: number, price: number, comment: string) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    return await business.payEmployee(src, cid, price, comment);
  } catch (e) {
    business.logger.error(`Failed to pay employee ${src} -> ${cid}: ${e}`);
    return false;
  }
});

RPC.register('business:server:payExtern', async (src, id: number, cid: number, price: number, comment: string) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    return await business.payExtern(src, cid, price, comment);
  } catch (e) {
    business.logger.error(`Failed to pay extern ${src} -> ${cid}: ${e}`);
    return false;
  }
});

RPC.register('business:server:chargeExtern', async (src, id: number, cid: number, price: number, comment: string) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    return await business.chargeExtern(src, cid, price, comment);
  } catch (e) {
    business.logger.error(`Failed to charge extern ${src} -> ${cid}: ${e}`);
    return false;
  }
});

RPC.register('business:server:addRole', async (src, id: number, role: string, permissions: string[]) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    await business.createRole(src, role, permissions);
    return true;
  } catch (e) {
    business.logger.error(`Failed to create role by ${src}, name: ${role}: ${e}`);
    return false;
  }
});

RPC.register(
  'business:server:updateRole',
  async (src, id: number, role: string, permissions: Record<string, boolean>) => {
    const business = getBusinessById(id);
    if (!business) return false;
    try {
      return await business.updateRole(src, role, permissions);
    } catch (e) {
      business.logger.error(`Failed to update role by ${src}, name: ${role}: ${e}`);
      return false;
    }
  }
);

RPC.register('business:server:removeRole', async (src, id: number, role: string) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    await business.deleteRole(src, role);
    return true;
  } catch (e) {
    business.logger.error(`Failed to remove role by ${src}, name: ${role}: ${e}`);
    return false;
  }
});

RPC.register(
  'business:server:updateBank',
  async (src, id: number, cid: number, permissions: IFinancials.Permissions) => {
    const business = getBusinessById(id);
    if (!business) return false;
    try {
      await business.changeBankPermission(src, cid, permissions);
      return true;
    } catch (e) {
      business.logger.error(`Failed to update bank permissions: ${src} -> ${cid}: ${e}`);
      return false;
    }
  }
);

RPC.register('business:server:getLogs', async (src, id: number, offset: number) => {
  const business = getBusinessById(id);
  if (!business) return false;
  try {
    return await business.getLogs(offset);
  } catch (e) {
    business.logger.error(`Failed to get logs, ${src} offset: ${offset}: ${e}`);
    return [];
  }
});

setImmediate(() => {
  if (!Util.isDevEnv()) return;

  Chat.registerCommand(
    'createBusiness',
    'Create a new business',
    [
      {
        name: 'name',
        description: 'Name of business',
        required: true,
      },
      {
        name: 'label',
        description: 'label of business',
        required: true,
      },
      {
        name: 'cid',
        description: 'CitizenID of owner',
        required: true,
      },
      {
        name: 'type',
        description: 'name of business type',
        required: true,
      },
    ],
    'developer',
    (src, _, params) => {
      if (Number.isNaN(parseInt(params[2]))) {
        throw new Error('CitizenId should be a valid integer');
      }
      createBusiness(params[0], params[1], Number(params[2]), params[3]);
    }
  );
});

Events.onNet('business:server:signIn', (plyId, businessName: string) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.signIn(plyId);
});

Events.onNet('business:server:signOut', (plyId, businessName: string) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.signOut(plyId);
});

Events.onNet('business:server:openSignedInList', (plyId, businessName: string) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.openSignedInList(plyId);
});

Events.onNet('business:server:forceOffDuty', (plyId: number, businessId: number, targetId: number) => {
  const business = getBusinessById(businessId);
  if (!business) return;
  business.forceOffDuty(plyId, targetId);
});

Events.onNet('business:server:enterBusiness', (plyId, businessName: string) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.playerEntered(plyId);
});

Events.onNet('business:server:leaveBusiness', (plyId, businessName: string) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.playerLeft(plyId);
});

Events.onNet('business:server:trySetRegister', (plyId, businessName: string, registerIdx: number) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.trySetRegister(plyId, registerIdx);
});

Events.onNet('business:server:setRegister', (plyId, businessId: number, registerIdx: number, items: string[]) => {
  const business = getBusinessById(businessId);
  if (!business) return;
  business.setRegister(plyId, registerIdx, items);
});

Events.onNet('business:server:cancelRegister', (plyId, businessName: string, registerIdx: number) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.cancelRegister(plyId, registerIdx);
});

Events.onNet('business:server:checkRegister', (plyId, businessName: string, registerIdx: number) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.checkRegister(plyId, registerIdx);
});

Events.onNet('business:server:payRegister', (plyId, businessId: number, registerIdx: number, orderId: string) => {
  const business = getBusinessById(businessId);
  if (!business) return;
  business.payRegister(plyId, registerIdx, orderId);
});

Events.onNet('business:server:openPriceMenu', (plyId, businessName: string) => {
  const business = getBusinessByName(businessName);
  if (!business) return;
  business.openPriceMenu(plyId);
});
