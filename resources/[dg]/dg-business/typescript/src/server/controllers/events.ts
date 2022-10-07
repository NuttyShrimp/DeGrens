import { Chat, Events, RPC, Util } from '@dgx/server';
import { config, loadConfig } from '../services/config';
import { createBusiness, getBusinessById, getBusinessEmployees, getBusinessesForPlayer } from '../services/business';

setImmediate(() => {
  loadConfig();
  if (Util.isDevEnv()) {
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
        if (Number.isNaN(parseInt(params[1]))) {
          throw new Error('CitizenId should be a valid integer');
        }
        createBusiness(params[0], params[1], Number(params[2]), params[3]);
      }
    );
  }
});

onNet('dg-config:moduleLoaded', (module: string) => {
  if (module !== 'business') return;
  loadConfig();
});

onNet('DGCore:Server:OnPlayerLoaded', () => {
  Events.emitNet('business:client:setPermLabels', source, config.permissions.labels);
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
    business.logger.error(`Failed to hire ${src} -> ${cid}: ${e}`);
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
      return business.updateRole(src, role, permissions);
    } catch (e) {
      business.logger.error(`Failed to create role by ${src}, name: ${role}: ${e}`);
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
    business.logger.error(`Failed to create role by ${src}, name: ${role}: ${e}`);
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
