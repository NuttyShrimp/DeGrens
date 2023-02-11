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
          if (!entity) return;
          Events.emitNet('vehicles:plate:useFakePlate', NetworkGetNetworkIdFromEntity(entity));
        },
        canInteract(veh) {
          if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
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
          if (!entity) return;
          Events.emitNet('vehicles:plate:removeFakePlate', NetworkGetNetworkIdFromEntity(entity));
        },
        canInteract(veh) {
          if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
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
          if (!entity) return;
          Events.emitNet('vehicles:upgrades:installItem', NetworkGetNetworkIdFromEntity(entity), 'neon');
        },
        canInteract: veh => {
          if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
          return hasVehicleKeys(veh);
        },
      },
      {
        label: 'Installeer Xenon',
        icon: 'fas fa-lightbulb',
        items: 'xenon_lights',
        action: (_, entity) => {
          if (!entity) return;
          Events.emitNet('vehicles:upgrades:installItem', NetworkGetNetworkIdFromEntity(entity), 'xenon');
        },
        canInteract: ent => {
          if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
          return isCloseToHood(ent, 2) && hasVehicleKeys(ent);
        },
      },
      {
        label: 'Lees VIN',
        icon: 'fas fa-barcode',
        action: async (_, entity) => {
          if (!entity) return;
          const vin = await getVehicleVin(entity);
          if (!vin) return;
          Notifications.add(`VIN: '${vin}'`, 'info');
        },
        canInteract: ent => {
          if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
          return isCloseToHood(ent, 2, true);
        },
      },
      {
        label: 'Check Service Status',
        icon: 'fas fa-wrench',
        action: (_, entity) => {
          if (!entity) return;
          openServiceStatusOverview(entity);
        },
        canInteract: ent => {
          if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
          return isCloseToHood(ent, 2, true);
        },
      },
      {
        label: 'Tank',
        icon: 'fas fa-gas-pump',
        action: async (_, entity) => {
          if (!entity) return;
          openRefuelMenu(entity);
        },
        canInteract(entity: number) {
          if (!entity || !NetworkGetEntityIsNetworked(entity)) return false;
          return canRefuel(entity);
        },
      },
      {
        label: 'Controlleer Tuning',
        icon: 'fas fa-magnifying-glass',
        job: 'police',
        action: (_, entity) => {
          if (!entity) return;
          checkIllegalTunes(entity);
        },
        canInteract: veh => {
          if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
          return isCloseToHood(veh, 2, true);
        },
      },
      {
        label: 'Open Tunes',
        icon: 'fas fa-engine',
        action: (_, entity) => {
          if (!entity) return;
          // Validation not required because if it does not have a vin already neither would it have any upgrades
          const vin = getVehicleVinWithoutValidation(entity);
          if (!vin) {
            Notifications.add('Kon tunes niet openen', 'error');
            return;
          }
          Inventory.openTunes(vin);
        },
        // TODO: add crim zones
        canInteract: veh => {
          if (!veh || !NetworkGetEntityIsNetworked(veh)) return false;
          return isCloseToHood(veh, 2, true) && hasVehicleKeys(veh) && !!getCurrentWorkingShop();
        },
      },
      {
        label: 'Geef Sleutels',
        icon: 'fas fa-key',
        action: (_, entity) => {
          if (!entity) return;
          const numSeats = GetVehicleModelNumberOfSeats(GetEntityModel(entity));
          Events.emitNet('vehicles:keys:shareToClosest', NetworkGetNetworkIdFromEntity(entity), numSeats);
        },
        canInteract: ent => {
          if (!ent || !NetworkGetEntityIsNetworked(ent)) return false;
          if (!hasVehicleKeys(ent)) return false;
          // Option enabled if someone in driverseat, passenger seats or close and outside vehicle
          return (
            !IsVehicleSeatFree(ent, -1) ||
            GetVehicleNumberOfPassengers(ent) > 0 ||
            Util.isAnyPlayerCloseAndOutsideVehicle(3)
          );
        },
      },
      {
        label: 'Flip Voertuig',
        icon: 'fas fa-hand',
        action: (_, entity) => {
          if (!entity) return;
          flipVehicle(entity);
        },
        canInteract: entity => {
          if (!entity || !NetworkGetEntityIsNetworked(entity)) return false;
          return isVehicleUpsideDown(entity);
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
      {
        label: 'Impound',
        icon: 'garage-car',
        canInteract: ent =>
          ent != undefined &&
          isDoingAJob(ent) &&
          PolyZone.isPointInside(Util.getEntityCoords(ent), 'vehicles_depot_impound'),
        action: async (_, ent) => {
          if (!ent) return;
          const [cancelled] = await Taskbar.create('garage-car', 'In beslag nemen', 15000, {
            canCancel: true,
            cancelOnDeath: true,
            cancelOnMove: true,
            disablePeek: true,
            controlDisables: {
              combat: true,
              movement: true,
            },
            animation: {
              animDict: 'missexile3',
              anim: 'ex03_dingy_search_case_a_michael',
              flags: 1,
            },
          });
          if (cancelled) {
            Notifications.add('Geannuleerd');
            return;
          }
          Events.emitNet('vehicles:depot:server:doImpound', NetworkGetNetworkIdFromEntity(ent));
        },
      },
    ],
  },
  true
);
