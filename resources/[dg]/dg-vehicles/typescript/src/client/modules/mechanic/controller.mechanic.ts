import { Business, Events, Inventory, Notifications, Peek, UI } from '@dgx/client';
import { isCloseToHood } from '@helpers/vehicle';
import { getVehicleVinWithoutValidation } from 'modules/identification/service.identification';
import { hasVehicleKeys } from 'modules/keys/cache.keys';
import { addToOrder, finishOrder, removeItem, clearItemOrder, openItemOrder } from './services/parts.mechanic';
import {
  hasVehicleAttached,
  takeHook,
  releaseVehicle,
  assignJob,
  canTow,
  attachHook,
  attachVehicleToTowVehicle,
  unattachVehicleFromTowVehicle,
} from './services/towing.mechanic';
import { getCurrentMechanicBusiness } from './service.mechanic';

let modelPeekIds: string[];

on('vehicles:mechanic:acceptTowJob', (data: { vin: string }) => {
  Events.emitNet('vehicles:mechanic:server:acceptTowJob', data.vin);
});

Events.onNet('vehicles:mechanic:client:loadConfig', (towVehicleModels: string[]) => {
  if (modelPeekIds) {
    Peek.removeModelEntry(modelPeekIds);
  }
  modelPeekIds = Peek.addModelEntry(towVehicleModels, {
    distance: 3,
    options: [
      {
        label: 'Take Hook',
        icon: 'truck-tow',
        canInteract: ent => {
          if (!ent) return false;
          if (!Business.isSignedInAtAnyOfType('mechanic')) return false;
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

UI.RegisterUICallback('mechanic/addPartToOrder', (data: { item: Mechanic.PartItem }, cb) => {
  addToOrder(data.item);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/finishOrder', (_, cb) => {
  finishOrder();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/removeFromOrder', (data: { idx: number }, cb) => {
  removeItem(data.idx);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('vehicles/mechanic/resetOrder', (data, cb) => {
  clearItemOrder();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Peek.addZoneEntry('mechanic_bench', {
  distance: 2,
  options: [
    {
      label: 'Open Werktafel',
      icon: 'screwdriver-wrench',
      canInteract: (_, __, data) => {
        return (
          Business.isEmployee(data.data.businessName, ['crafting']) &&
          getCurrentMechanicBusiness() === data.data.businessName
        );
      },
      action: () => {
        Inventory.openBench('mechanic_bench');
      },
    },
    {
      label: 'Open Stash',
      icon: 'box-open',
      canInteract: (_, __, data) => {
        return (
          Business.isEmployee(data.data.businessName, ['stash']) &&
          getCurrentMechanicBusiness() === data.data.businessName
        );
      },
      action: data => {
        Inventory.openStash(`mechanic-shop-stash-${data.data.businessName}`, 100);
      },
    },
    {
      label: 'Maak Parts',
      icon: 'toolbox',
      canInteract: (_, __, data) => {
        return (
          Business.isEmployee(data.data.businessName, ['crafting']) &&
          getCurrentMechanicBusiness() === data.data.businessName
        );
      },
      action: () => {
        Events.emitNet('vehicles:mechanic:openPartsMenu');
      },
    },
    {
      label: 'Maak Order',
      icon: 'ticket',
      canInteract: (_, __, data) => {
        return getCurrentMechanicBusiness() === data.data.businessName;
      },
      action: () => {
        openItemOrder();
      },
    },
  ],
});

Peek.addGlobalEntry('vehicle', {
  options: [
    {
      label: 'Open Tunes',
      icon: 'fas fa-engine',
      action: (_, entity) => {
        if (!entity) return;
        if (!getCurrentMechanicBusiness()) return;
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
        return isCloseToHood(veh, 2, true) && hasVehicleKeys(veh) && !!getCurrentMechanicBusiness();
      },
    },
    {
      label: 'Check Service Status',
      icon: 'fas fa-wrench',
      action: (_, entity) => {
        if (!entity) return;
        Events.emitNet('vehicles:service:showOverview', NetworkGetNetworkIdFromEntity(entity));
      },
      canInteract: ent => {
        if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
        return isCloseToHood(ent, 2, true);
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

UI.RegisterUICallback('mechanic/createPart', (data: { item: Mechanic.PartItem }, cb) => {
  Events.emitNet('vehicles:mechanic:createPart', data.item);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('vehicles:towing:attach', (towVehicleNetId: number, attachVehicleNetId: number, offset: Vec3) => {
  attachVehicleToTowVehicle(towVehicleNetId, attachVehicleNetId, offset);
});

Events.onNet('vehicles:towing:unattach', (towVehicleNetId: number, attachVehicleNetId: number) => {
  unattachVehicleFromTowVehicle(towVehicleNetId, attachVehicleNetId);
});
