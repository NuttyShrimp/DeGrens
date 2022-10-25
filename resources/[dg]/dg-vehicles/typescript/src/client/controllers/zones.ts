import { Events, Inventory, Notifications, Peek, PolyZone, Taskbar, Util } from '@dgx/client';
import { canRefuel, openRefuelMenu } from 'modules/fuel/service.fuel';
import { hasVehicleKeys } from 'modules/keys/cache.keys';
import { attachHook, getCurrentWorkingShop, canTow, isDoingAJob } from 'modules/mechanic/service.mechanic';
import { openServiceStatusOverview } from 'modules/status/service.status';
import { checkIllegalTunes } from 'modules/upgrades/service.upgrades';
import { flipVehicle } from 'services/flipcar';

import {
  getVehicleVin,
  getVehicleVinWithoutValidation,
  isCloseToBoot,
  isCloseToHood,
  isVehicleUpsideDown,
} from '../helpers/vehicle';

// TODO: move these to modules they belong to
Peek.addGlobalEntry(
  'vehicle',
  {
    distance: 2,
    options: [
      {
        label: 'Vervang nummerplaat',
        icon: 'fas fa-screwdriver',
        items: 'fakeplate',
        action: (_, entity) => {
          Events.emitNet('vehicles:plate:useFakePlate', NetworkGetNetworkIdFromEntity(entity));
        },
        canInteract(veh: number) {
          if (!hasVehicleKeys(veh)) return false;
          const vehState = Entity(veh).state;
          if (vehState.fakePlate) return false;
          return isCloseToBoot(veh, 2);
        },
      },
      {
        label: 'Verwijder nummerplaat',
        icon: 'fas fa-screwdriver',
        action: (_, entity) => {
          Events.emitNet('vehicles:plate:removeFakePlate', NetworkGetNetworkIdFromEntity(entity));
        },
        canInteract(veh: number) {
          if (!hasVehicleKeys(veh)) return false;
          const vehState = Entity(veh).state;
          if (!vehState?.fakePlate) return false;
          return isCloseToBoot(veh, 2);
        },
      },
      {
        label: 'Plaats Neon',
        icon: 'fas fa-lightbulb',
        items: 'neon_strip',
        action: (_, entity) => {
          Events.emitNet('vehicles:upgrades:installItem', NetworkGetNetworkIdFromEntity(entity), 'neon');
        },
        canInteract: veh => hasVehicleKeys(veh),
      },
      {
        label: 'Installeer Xenon',
        icon: 'fas fa-lightbulb',
        items: 'xenon_lights',
        action: (_, entity) => {
          Events.emitNet('vehicles:upgrades:installItem', NetworkGetNetworkIdFromEntity(entity), 'xenon');
        },
        canInteract: ent => isCloseToHood(ent, 2) && hasVehicleKeys(ent),
      },
      {
        label: 'Lees VIN',
        icon: 'fas fa-barcode',
        action: async (_, entity) => {
          const vin = await getVehicleVin(entity);
          if (!vin) return;
          Notifications.add(`VIN: '${vin}'`, 'info');
        },
        canInteract: ent => isCloseToHood(ent, 2, true) && NetworkGetEntityIsNetworked(ent),
      },
      {
        label: 'Check Service Status',
        icon: 'fas fa-wrench',
        action: (_, entity) => {
          openServiceStatusOverview(entity);
        },
        canInteract: ent => isCloseToHood(ent, 2, true) && NetworkGetEntityIsNetworked(ent),
      },
      {
        label: 'Tank',
        icon: 'fas fa-gas-pump',
        action: async (_, entity) => {
          const vin = await getVehicleVin(entity);
          if (!vin) return;
          openRefuelMenu(vin);
        },
        canInteract(entity: number) {
          return canRefuel(entity) && NetworkGetEntityIsNetworked(entity);
        },
      },
      {
        label: 'Controlleer Tuning',
        icon: 'fas fa-magnifying-glass',
        job: 'police',
        action: (_, entity) => {
          checkIllegalTunes(entity);
        },
        canInteract: veh => {
          return isCloseToHood(veh, 2, true) && NetworkGetEntityIsNetworked(veh);
        },
      },
      {
        label: 'Open Tunes',
        icon: 'fas fa-engine',
        action: (_, entity) => {
          // Validation not required because if it does not have a vin already neither would it have any upgrades
          const vin = getVehicleVinWithoutValidation(entity);
          if (!vin) {
            Notifications.add('Kon tunes niet openen', 'error');
            return;
          }
          Inventory.openTunes(vin);
        },
        // TODO: add crim zones
        canInteract: veh => isCloseToHood(veh, 2, true) && hasVehicleKeys(veh) && !!getCurrentWorkingShop(),
      },
      {
        label: 'Geef Sleutels',
        icon: 'fas fa-key',
        action: (_, entity) => {
          Events.emitNet('vehicles:keys:shareToClosest', NetworkGetNetworkIdFromEntity(entity));
        },
        canInteract: ent => NetworkGetEntityIsNetworked(ent) && hasVehicleKeys(ent),
      },
      {
        label: 'Flip Voertuig',
        icon: 'fas fa-hand',
        action: (_, entity) => {
          flipVehicle(entity);
        },
        canInteract: entity => NetworkGetEntityIsNetworked(entity) && isVehicleUpsideDown(entity),
      },
      {
        label: 'Attach hook',
        icon: 'truck-tow',
        canInteract: ent => canTow(ent),
        action: (_, ent) => {
          attachHook(ent);
        },
      },
      {
        label: "Do Impound",
        icon: "garage-car",
        canInteract: ent => isDoingAJob(ent) && PolyZone.isPointInside(Util.getEntityCoords(ent), 'vehicles_depot_impound'),
        action: async (_, ent) => {
          const [cancelled] = await Taskbar.create("garage-car", "Voertuig inbeslagnemen", 15000, {
            canCancel: true,
            cancelOnDeath: true,
            cancelOnMove: true,
            disablePeek: true,
            controlDisables: {
              combat: true,
              movement: true
            },
            animation: {
                animDict: 'missexile3',
                anim: 'ex03_dingy_search_case_a_michael',
                flags: 1,
            }
          })
          if (cancelled) {
            Notifications.add("Geannuleerd");
            return;
          }
          Events.emitNet('vehicles:depot:server:doImpound', NetworkGetNetworkIdFromEntity(ent));
        }
      }
    ],
  },
  true
);
