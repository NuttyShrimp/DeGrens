import { BlipManager, Business, Events, Inventory, Notifications, Peek, PolyTarget, PolyZone, UI } from '@dgx/client';

import {
  assignJob,
  attachHook,
  canTow,
  clearItemOrder,
  finishOrder,
  getAmountOfItemInStash,
  getCurrentWorkingShop,
  hasVehicleAttached,
  isClockedIn,
  isInRepairZone,
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
import { isCloseToHood } from '@helpers/vehicle';
import { getVehicleVinWithoutValidation } from 'modules/identification/service.identification';
import { hasVehicleKeys } from 'modules/keys/cache.keys';
import { openServiceStatusOverview } from 'modules/status/service.status';

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
    BlipManager.addBlip({
      category: 'dg-vehicles',
      id: `mechanic-${shop}`,
      text: shopConfig.label,
      coords: shopConfig.repair.coords,
      sprite: 446,
      color: 5,
      scale: 0.8,
    });
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
        canInteract: ent => {
          if (!isClockedIn()) return false;
          if (!ent) return false;
          return !hasVehicleAttached(ent);
        },
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

Peek.addZoneEntry('mechanic-clock-board', {
  distance: 2,
  options: [
    {
      label: 'Inklokken',
      canInteract: (_, __, data) => {
        return Business.isEmployee(data.data.id) && !isClockedIn();
      },
      action: data => {
        setClockInStatus(true, data.data.id);
      },
      icon: 'right-to-bracket',
    },
    {
      label: 'Uitklokken',
      canInteract: (_, __, data) => {
        return Business.isEmployee(data.data.id) && getCurrentWorkingShop() === data.data.id;
      },
      action: data => {
        setClockInStatus(false, data.data.id);
      },
      icon: 'right-from-bracket',
    },
  ],
});

Peek.addZoneEntry('mechanic-bench', {
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
});

PolyZone.onEnter('mechanic-repair', (_, data) => {
  setRepairZone(data.id);
});

PolyZone.onLeave('mechanic-repair', _ => {
  setRepairZone(null);
});

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Open Tunes',
      icon: 'fas fa-engine',
      action: (_, entity) => {
        if (!entity) return;
        if (!getCurrentWorkingShop()) return;
        // Validation not required because if it does not have a vin already neither would it have any upgrades
        const vin = getVehicleVinWithoutValidation(entity);
        if (!vin) {
          Notifications.add('Kon tunes niet openen', 'error');
          return;
        }
        Inventory.openTunes(vin);
      },
      // TODO: add crim zones someday
      canInteract: veh => {
        if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
        if (GetVehicleClass(veh) === 18) return false;
        return isCloseToHood(veh, 2, true) && hasVehicleKeys(veh) && !!getCurrentWorkingShop();
      },
    },
    {
      label: 'Check Service Status',
      icon: 'fas fa-wrench',
      action: (_, entity) => {
        if (!entity) return;
        openServiceStatusOverview(entity);
      },
      // TODO: add crim zones someday
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        return isInRepairZone() && isCloseToHood(ent, 2, true);
      },
    },
    {
      label: 'Attach hook',
      icon: 'truck-tow',
      canInteract: ent => ent != undefined && canTow(ent),
      action: (_, ent) => {
        if (!ent) return;
        attachHook(ent);
      },
    },
  ],
  distance: 2,
});
