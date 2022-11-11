import { Events, Notifications, Peek, PolyTarget, PolyZone, Minigames, Taskbar } from '@dgx/client';
import { Vector4 } from '@dgx/shared';

let sanddiggingLocations: Omit<Sanddigging.Config, 'quarry'> = {
  spots: [],
  vehicle: Vector4.create(0),
};

let assignedSpot: number | null = null;
let spotBlip = 0;

let assignedVehicle: number | null = null;
let vehiclePeekId: string[] = [];

let atVehicleReturn = false;
let returnBlip = 0;

export const loadSanddiggingConfig = (config: Sanddigging.Config) => {
  const { quarry, ...rest } = config;
  sanddiggingLocations = rest;
  PolyZone.addPolyZone('sanddigging_quarry', quarry, { data: {} });
};

export const setAssignedSpot = (spot: typeof assignedSpot) => {
  if (assignedSpot === spot) return;
  assignedSpot = spot;

  PolyTarget.removeZone('sanddigging_spot');
  if (DoesBlipExist(spotBlip)) {
    RemoveBlip(spotBlip);
  }

  if (assignedSpot === null) return;

  const spotLocation = sanddiggingLocations.spots[assignedSpot];
  PolyTarget.addCircleZone('sanddigging_spot', spotLocation, 4, { useZ: true, data: {} });
  spotBlip = AddBlipForCoord(spotLocation.x, spotLocation.y, spotLocation.z);
  SetBlipSprite(spotBlip, 85);
  SetBlipColour(spotBlip, 5);
  SetBlipDisplay(spotBlip, 2);
  SetBlipAsShortRange(spotBlip, false);
  SetBlipScale(spotBlip, 0.8);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Groeve Graafplek');
  EndTextCommandSetBlipName(spotBlip);
  SetBlipRoute(spotBlip, true);
  SetBlipRouteColour(spotBlip, 5);
};

export const setAssignedVehicle = (veh: typeof assignedVehicle) => {
  if (assignedVehicle === veh) return;
  assignedVehicle = veh;

  if (assignedVehicle === null) {
    Peek.removeEntityEntry(vehiclePeekId);
    vehiclePeekId = [];
    if (DoesBlipExist(returnBlip)) {
      RemoveBlip(returnBlip);
    }
    PolyZone.removeZone('sanddigging_vehicle');
    return;
  }

  vehiclePeekId = Peek.addEntityEntry(assignedVehicle, {
    options: [
      {
        icon: 'fas fa-map',
        label: 'Bekijk Locatie',
        action: () => {
          Events.emitNet('jobs:sanddigging:assignNewSpot');
        },
      },
    ],
  });
  Notifications.add(
    'De locatie staat in het voertuig. Indien je wil stoppen, gelieve het voertuig terug te zetten en je huidige groep te verlaten!',
    'info',
    20000
  );
  const { w: vehicleHeading, ...vehiclePosition } = sanddiggingLocations.vehicle;
  PolyZone.addBoxZone('sanddigging_vehicle', vehiclePosition, 10, 10, {
    heading: vehicleHeading,
    minZ: vehiclePosition.z - 2,
    maxZ: vehiclePosition.z + 5,
    data: {},
  });
  returnBlip = AddBlipForCoord(vehiclePosition.x, vehiclePosition.y, vehiclePosition.z);
  SetBlipSprite(returnBlip, 227);
  SetBlipColour(returnBlip, 5);
  SetBlipDisplay(returnBlip, 2);
  SetBlipAsShortRange(returnBlip, true);
  SetBlipScale(returnBlip, 0.9);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString('Groeve Voertuig Garage');
  EndTextCommandSetBlipName(returnBlip);
};

export const doSpotAction = async () => {
  const minigameSucces = await Minigames.keygame(2, 2, 10);
  if (!minigameSucces) {
    Notifications.add('Je bent echt slecht hierin...');
    return;
  }

  const [canceled] = await Taskbar.create('shovel', 'Graven', 10000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'amb@world_human_gardener_plant@male@base',
      anim: 'base',
      flags: 1,
    },
  });
  if (canceled) return;

  Events.emitNet('jobs:sanddigging:receive', assignedSpot);
  setAssignedSpot(null);
};

export const isAtVehicleReturn = () => atVehicleReturn;
export const setAtVehicleReturn = (val: boolean) => {
  atVehicleReturn = val;
};

export const finishJob = () => {
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);
  if (!veh) {
    Notifications.add('Je zit niet in een voertuig', 'error');
    return;
  }
  const netId = NetworkGetNetworkIdFromEntity(veh);
  if (netId !== assignedVehicle) {
    Notifications.add('Dit is niet het werkvoertuig', 'error');
    return;
  }
  TaskLeaveVehicle(ped, veh, 0);
  setTimeout(() => {
    Events.emitNet('jobs:sanddigging:finish', netId);
  }, 1000);
};

// Used when player char while in job or left group
export const cleanupSanddigging = () => {
  setAssignedSpot(null);
  setAssignedVehicle(null);
};
