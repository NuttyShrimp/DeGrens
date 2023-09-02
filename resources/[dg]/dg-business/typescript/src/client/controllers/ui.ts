import { UI, RPC, Events } from '@dgx/client';
import { addToItemOrder, confirmItemOrder, removeFromItemOrder } from 'service/itemorder';

UI.RegisterUICallback('phone/business/get', async (_, cb) => {
  const businesses = await RPC.execute('business:server:getAll');
  cb({ data: businesses, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/business/employees', async (data: { id: number }, cb) => {
  const employees = (await RPC.execute<Business.UI.Employee[]>('business:server:getEmployees', data.id)) ?? [];
  cb({
    data: employees,
    meta: { ok: employees.length > 0, message: employees.length > 0 ? 'done' : 'business not found' },
  });
});

UI.RegisterUICallback('phone/business/roles', async (data: { id: number }, cb) => {
  const roles = (await RPC.execute<string[]>('business:server:getRoles', data.id)) ?? [];
  cb({
    data: roles,
    meta: { ok: Object.keys(roles).length > 0, message: Object.keys(roles).length > 0 ? 'done' : 'business not found' },
  });
});

UI.RegisterUICallback('phone/business/updateEmployee', async (data: { id: number; cid: number; role: string }, cb) => {
  const success = await RPC.execute('business:server:updateEmployee', data.id, data.cid, data.role);
  cb({
    data: success,
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('phone/business/hireEmployee', async (data: { id: number; cid: number; role: string }, cb) => {
  const employeeName = await RPC.execute<string | false>('business:server:hire', data.id, data.cid, data.role);
  cb({
    data: employeeName,
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('phone/business/fireEmployee', async (data: { id: number; cid: number }, cb) => {
  const success = await RPC.execute('business:server:fire', data.id, data.cid);
  cb({
    data: success,
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback(
  'phone/business/payEmployee',
  async (data: { id: number; cid: number; price: number; comment: string }, cb) => {
    const success = await RPC.execute('business:server:payEmployee', data.id, data.cid, data.price, data.comment);
    cb({
      data: success,
      meta: { ok: true, message: 'done' },
    });
  }
);

UI.RegisterUICallback(
  'phone/business/payExtern',
  async (data: { id: number; cid: number; price: number; comment: string }, cb) => {
    const success = await RPC.execute('business:server:payExtern', data.id, data.cid, data.price, data.comment);
    cb({
      data: success,
      meta: { ok: true, message: 'done' },
    });
  }
);

UI.RegisterUICallback(
  'phone/business/chargeExtern',
  async (data: { id: number; cid: number; price: number; comment: string }, cb) => {
    const success = await RPC.execute('business:server:chargeExtern', data.id, data.cid, data.price, data.comment);
    cb({
      data: success,
      meta: { ok: true, message: 'done' },
    });
  }
);

UI.RegisterUICallback(
  'phone/business/addRole',
  async (data: { id: number; role: string; permissions: string[] }, cb) => {
    const success = await RPC.execute('business:server:addRole', data.id, data.role, data.permissions);
    cb({
      data: success,
      meta: { ok: true, message: 'done' },
    });
  }
);

UI.RegisterUICallback(
  'phone/business/updateRole',
  async (data: { id: number; role: string; permissions: Record<string, boolean> }, cb) => {
    const newPerms = await RPC.execute('business:server:updateRole', data.id, data.role, data.permissions);
    cb({
      data: newPerms,
      meta: { ok: true, message: 'done' },
    });
  }
);

UI.RegisterUICallback('phone/business/removeRole', async (data: { id: number; role: string }, cb) => {
  const success = await RPC.execute('business:server:removeRole', data.id, data.role);
  cb({
    data: success,
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('phone/business/updateBank', async (data: { id: number; cid: number; perms: any }, cb) => {
  const success = await RPC.execute('business:server:updateBank', data.id, data.cid, data.perms);
  cb({
    data: success,
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('phone/business/getLogs', async (data: { id: number; offset: number }, cb) => {
  const logs = await RPC.execute('business:server:getLogs', data.id, data.offset);
  cb({
    data: logs,
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('business/forceOffDuty', (data: { businessId: number; plyId: number }, cb) => {
  Events.emitNet('business:server:forceOffDuty', data.businessId, data.plyId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback(
  'business/register/pay',
  (data: { businessId: number; registerIdx: number; orderId: string }, cb) => {
    Events.emitNet('business:server:payRegister', data.businessId, data.registerIdx, data.orderId);
    cb({ data: {}, meta: { ok: true, message: 'done' } });
  }
);

UI.RegisterUICallback('business/order/add', (data: { item: string }, cb) => {
  addToItemOrder(data.item);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('business/order/remove', (data: { itemIdx: number }, cb) => {
  removeFromItemOrder(data.itemIdx);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('business/order/confirm', (data: unknown, cb) => {
  confirmItemOrder();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback(
  'business/shop/buy',
  async (data: { item: string; businessId: number; itemLabel: string }, cb) => {
    cb({ data: {}, meta: { ok: true, message: 'done' } });

    const result = await UI.openInput<{ amount: string }>({
      header: `Hoeveel ${data.itemLabel} wil je kopen?`,
      inputs: [
        {
          type: 'number',
          name: 'amount',
          label: 'Aantal',
        },
      ],
    });
    if (!result.accepted) return;

    const amount = +result.values.amount;
    if (isNaN(amount) || amount <= 0) return;

    Events.emitNet('business:server:buyFromShop', data.businessId, data.item, amount);
  }
);
