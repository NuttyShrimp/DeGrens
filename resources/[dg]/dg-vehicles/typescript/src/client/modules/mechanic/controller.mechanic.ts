import { Business, Events, Inventory, Peek, PolyTarget, PolyZone, UI } from '@dgx/client';

import {
  assignJob,
  clearItemOrder,
  finishOrder,
  getAmountOfItemInStash,
  getCurrentWorkingShop,
  hasVehicleAttached,
  isClockedIn,
  openItemOrder,
  openPerfomanceItemOrderInput,
  openRepairItemOrderInput,
  releaseVehicle,
  removeItem,
  setClockInStatus,
  setRepairZone,
  setTowOffsets,
  takeHook,
} from './service.mechanic';

let modelPeekIds: string[];

on('vehicles:mechanic:acceptTowJob', (data: { vin: string }) => {
  Events.emitNet('vehicles:mechanic:server:acceptTowJob', data.vin);
});

Events.onNet('vehicles:mechanic:client:loadConfig', (zones: Mechanic.Shops, offsets: Record<string, Vec3>) => {
  for (const shop in zones) {
    const shopConfig = zones[shop];
    PolyTarget.addBoxZone(
      `mechanic-clock-board`,
      shopConfig.board.coords,
      shopConfig.board.width,
      shopConfig.board.length,
      {
        data: {
          id: shop,
        },
        heading: shopConfig.board.heading,
        minZ: shopConfig.board.coords.z,
        maxZ: shopConfig.board.coords.z + shopConfig.board.height,
      }
    );
    PolyTarget.addBoxZone('mechanic-bench', shopConfig.bench.coords, shopConfig.bench.width, shopConfig.bench.length, {
      data: {
        id: shop,
      },
      heading: shopConfig.bench.heading,
      minZ: shopConfig.bench.coords.z,
      maxZ: shopConfig.bench.coords.z + shopConfig.bench.height,
    });
    PolyZone.addBoxZone(
      'mechanic-repair',
      shopConfig.repair.coords,
      shopConfig.repair.width,
      shopConfig.repair.length,
      {
        data: {
          id: shop,
        },
        heading: shopConfig.repair.heading,
        minZ: shopConfig.repair.coords.z,
        maxZ: shopConfig.repair.coords.z + shopConfig.repair.height,
      }
    );
  }
  setTowOffsets(offsets);
  if (modelPeekIds) {
    Peek.removeModelEntry(modelPeekIds);
  }
  modelPeekIds = Peek.addModelEntry(Object.keys(offsets), {
    distance: 3,
    options: [
      {
        label: 'Take Hook',
        icon: 'truck-tow',
        canInteract: () => isClockedIn(),
        action: (_, ent) => {
          if (!ent) return;
          takeHook(ent);
        },
      },
      {
        label: 'Release vehicle',
        icon: 'truck-tow',
        canInteract: ent => {
          if (!ent) return false;
          return hasVehicleAttached(ent);
        },
        action: (_, ent) => {
          if (!ent) return;
          releaseVehicle(ent);
        },
      },
    ],
  });
});

Events.onNet('vehicles:mechanic:assignJob', (vin: string, coords: Vec3) => {
  assignJob(vin, coords);
});

UI.RegisterUICallback('vehicles/mechanic/addOrderPerformanceItem', (data, cb) => {
  openPerfomanceItemOrderInput();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/addOrderRepairItem', (data, cb) => {
  openRepairItemOrderInput();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/finishOrder', (data, cb) => {
  finishOrder();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/removeFromOrder', (data, cb) => {
  removeItem(data);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/resetOrder', (data, cb) => {
  clearItemOrder();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/getStashPerformanceAmount', async (data: Record<string, any>, cb) => {
  const amount = await getAmountOfItemInStash(data.type, data.part, data.class);
  cb({
    data: amount,
    meta: { ok: true, message: 'done' },
  });
});

UI.RegisterUICallback('vehicles/mechanic/getStashRepairAmount', async (data: Record<string, any>, cb) => {
  const amount = await getAmountOfItemInStash('repair', data.part, data.class);
  cb({
    data: amount,
    meta: { ok: true, message: 'done' },
  });
});

Peek.addZoneEntry(
  'mechanic-clock-board',
  {
    distance: 2,
    options: [
      {
        label: 'Clock in',
        canInteract: (_, __, data) => {
          return Business.isEmployee(data.data.id) && !isClockedIn();
        },
        action: data => {
          setClockInStatus(true, data.data.id);
        },
        icon: 'right-to-bracket',
      },
      {
        label: 'Clock out',
        canInteract: (_, __, data) => {
          return Business.isEmployee(data.data.id) && getCurrentWorkingShop() === data.data.id;
        },
        action: data => {
          setClockInStatus(false, data.data.id);
        },
        icon: 'right-from-bracket',
      },
    ],
  },
  true
);

Peek.addZoneEntry(
  'mechanic-bench',
  {
    distance: 2,
    options: [
      {
        label: 'Open Werktafel',
        icon: 'screwdriver-wrench',
        canInteract: (_, __, data) => {
          return Business.isEmployee(data.data.id, ['crafting']) && getCurrentWorkingShop() === data.data.id;
        },
        action: () => {
          Inventory.openBench('mechanic_bench');
        },
      },
      {
        label: 'Open Stash',
        icon: 'toolbox',
        canInteract: (_, __, data) => {
          return Business.isEmployee(data.data.id, ['stash']) && getCurrentWorkingShop() === data.data.id;
        },
        action: data => {
          Inventory.openStash(`mechanic-shop-stash-${data.data.id}`, 100);
        },
      },
      {
        label: 'Maak Order',
        icon: 'gear',
        canInteract: (_, __, data) => {
          return Business.isEmployee(data.data.id) && getCurrentWorkingShop() === data.data.id;
        },
        action: () => {
          openItemOrder();
        },
      },
    ],
  },
  true
);

PolyZone.onEnter('mechanic-repair', (_, data) => {
  setRepairZone(data.id);
});

PolyZone.onLeave('mechanic-repair', _ => {
  setRepairZone(null);
});
