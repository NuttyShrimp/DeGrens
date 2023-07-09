import { Events, Inventory, Notifications, RPC, Config, Util, UI, Business, Sync } from '@dgx/server';
import { getConfigByEntity } from '../info/service.info';
import { getServiceStatus, seedServiceStatuses, updateServiceStatus } from './services/store';
import {
  calculateNeededParts,
  clearVehicleStalls,
  setNativeStatus,
  setPercentagePerPart,
  useRepairPart,
} from './service.status';
import { getTyreState } from './helpers.status';
import { getVinForVeh } from 'helpers/vehicle';
import { DEFAULT_SERVICE_STATUS, SERVICE_CONDITIONS } from './constants.status';
import { REPAIR_PARTS } from '../../../shared/status/constants.status';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';
import { generatePerfectNativeStatus } from '@shared/status/helpers.status';

setImmediate(() => {
  seedServiceStatuses();

  Config.awaitConfigLoad().then(() => {
    const config = Config.getConfigValue<Service.Config>('vehicles.service');
    setPercentagePerPart(config.repairPercentagePerPart);
  });
});

Events.onNet('vehicles:service:saveStatus', (plyId: number, vin: string, status: Service.Status) => {
  updateServiceStatus(vin, status);
});

RPC.register('vehicles:service:getStatus', (src: number, vehNetId: number) => {
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  const vin = getVinForVeh(veh);
  return getServiceStatus(vin);
});

Events.onNet('vehicles:service:showOverview', async (plyId: number, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const vin = getVinForVeh(vehicle);
  if (!vin) return;

  // Service info
  const serviceStatus = getServiceStatus(vin);
  if (!serviceStatus) return;

  const partMenu: ContextMenu.Entry[] = [];
  const isActiveMechanic = Business.isPlayerSignedInAtAnyOfType(plyId, 'mechanic');

  for (const part in serviceStatus) {
    const partState = serviceStatus[part as Service.Part];
    const partPercentage = partState / 10;
    const serviceCondition = SERVICE_CONDITIONS.find(sc => sc.percentage <= partPercentage);
    const partsNeeded = calculateNeededParts(partState);

    partMenu.push({
      title: REPAIR_PARTS[part as Service.Part].label,
      description: isActiveMechanic
        ? `${partPercentage.toFixed(2)}% | ${Math.ceil(partsNeeded) || 'geen'} parts nodig`
        : `${serviceCondition?.label} condition`,
    });
  }

  // Class info
  const vehicleConfig = getConfigByEntity(vehicle);
  const infoMenu: ContextMenu.Entry[] = [
    {
      title: `${vehicleConfig?.brand} ${vehicleConfig?.name}`,
      description: `Class: ${vehicleConfig?.class ?? 'UNKNOWN'}`,
    },
  ];

  // Only show perf tunes to mechanic
  if (isActiveMechanic) {
    const upgrades = await upgradesManager.getPerformance(vin);
    infoMenu.push(
      ...[
        {
          title: 'Brakes',
          description: (upgrades?.brakes ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.brakes + 1}`,
        },
        {
          title: 'Engine',
          description: (upgrades?.engine ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.engine + 1}`,
        },
        {
          title: 'Transmission',
          description: (upgrades?.transmission ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.transmission + 1}`,
        },
        {
          title: 'Turbo',
          description: upgrades?.turbo ? `Geinstalleerd` : 'Niet geinstalleerd',
        },
        {
          title: 'Suspension',
          description: (upgrades?.suspension ?? -1) === -1 ? 'Basis' : `Level ${upgrades!.suspension + 1}`,
        },
      ]
    );
  }

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Voertuig info',
      submenu: infoMenu,
    },
    {
      title: 'Voertuig status',
      submenu: partMenu,
    },
  ];
  UI.openContextMenu(plyId, menu);
});

Object.entries(REPAIR_PARTS).forEach(([part, { itemName }]) => {
  Inventory.registerUseable(itemName, (plyId, itemState) => {
    useRepairPart(plyId, part as Service.Part, itemState);
  });
});

// for some reason if you wanna pop 0 or 4 you also need to pop those other ones :shrug:
const LINKED_TYRE_IDS: Record<number, number> = { 0: 6, 4: 7 };
global.exports('popTyre', async (vehicle: number) => {
  const wheelStatus = await getTyreState(vehicle);
  if (!wheelStatus) return;
  for (let i = 0; i < wheelStatus.length; i++) {
    if (wheelStatus[i] === 1000) {
      wheelStatus[i] = -1;
      const linked = LINKED_TYRE_IDS[i];
      if (linked) {
        wheelStatus[linked] = -1;
      }
      break;
    }
  }
  setNativeStatus(vehicle, {
    wheels: wheelStatus,
  });
});

Inventory.registerUseable(['repair_kit', 'advanced_repair_kit', 'tire_repair_kit'], (plyId, itemState) => {
  if (GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false)) {
    Notifications.add(plyId, 'Je kan dit niet gebruiken in de wagen', 'error');
    return;
  }
  Events.emitNet('vehicles:status:useRepairItem', plyId, itemState.name, itemState.id);
});

Events.onNet(
  'vehicles:status:finishRepairItemUsage',
  async (plyId, itemId: string, itemName: string, netId: number, data: Record<string, any>) => {
    const vehicle = NetworkGetEntityFromNetworkId(netId);
    if (!vehicle || !DoesEntityExist(vehicle)) return;

    const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemId);
    if (!removed) {
      Notifications.add(plyId, 'Je hebt dit niet meer', 'error');
      return;
    }

    switch (itemName) {
      case 'repair_kit':
        const increase = Config.getConfigValue<number>('vehicles.config.repairKitAmount');
        if (!increase) return;
        clearVehicleStalls(vehicle);
        setNativeStatus(vehicle, {
          engine: (data.oldHealth ?? 0) + increase,
        });
        break;
      case 'advanced_repair_kit':
        clearVehicleStalls(vehicle);
        Sync.executeAction('vehicles:status:fix', vehicle);
        break;
      case 'tire_repair_kit':
        setNativeStatus(vehicle, {
          wheels: generatePerfectNativeStatus().wheels,
        });
        break;
    }
  }
);

global.exports('clearServiceStatus', (vehicle: number) => {
  const vin = getVinForVeh(vehicle);
  if (!vin) return;
  updateServiceStatus(vin, { ...DEFAULT_SERVICE_STATUS });
});

global.exports('doAdminFix', (vehicle: number) => {
  Sync.executeAction('vehicles:status:fix', vehicle);
  clearVehicleStalls(vehicle);
});
