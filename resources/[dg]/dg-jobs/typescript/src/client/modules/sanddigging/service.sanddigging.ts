import { Events, Notifications, PolyTarget, PolyZone, Minigames, Taskbar, Phone, UI, Keys } from '@dgx/client';
import { Vector4 } from '@dgx/shared';

let sanddiggingLocations: Pick<Sanddigging.Config, 'spots' | 'vehicle'> = {
  spots: [],
  vehicle: Vector4.create(0),
};

let assignedSpot: number | null = null;
let spotBlip = 0;
let isAtAssignedSpot = false;

let assignedVehicle: number | null = null;
let inAssignedVehicle = false;

let atVehicleReturn = false;
let returnBlip = 0;

export const loadSanddiggingConfig = (config: Sanddigging.Config) => {
  sanddiggingLocations = config;
};

export const setAssignedSpot = (spot: typeof assignedSpot) => {
  if (assignedSpot === spot) return;
  assignedSpot = spot;

  PolyZone.removeZone('sanddigging_spot');
  if (DoesBlipExist(spotBlip)) {
    RemoveBlip(spotBlip);
  }

  if (assignedSpot === null) return;

  const spotLocation = sanddiggingLocations.spots[assignedSpot];
  PolyZone.addCircleZone('sanddigging_spot', spotLocation, 8, { useZ: true, data: {}, routingBucket: 0 });
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
    if (DoesBlipExist(returnBlip)) {
      RemoveBlip(returnBlip);
    }
    PolyZone.removeZone('sanddigging_vehicle');
    return;
  }

  Phone.sendMail(
    'Querry Medewerker',
    'Jan Zand',
    'Je kan een nieuwe locatie bekijken via het voertuig. Indien je wil stoppen, gelieve het voertuig terug te zetten waar je het genomen hebt en je huidige groep te verlaten!'
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
  if (IsPedInAnyVehicle(PlayerPedId(), false)) return;

  const spot = assignedSpot;
  setAssignedSpot(null);

  // We set assigned spot to null at start of action & restore if its still null when failed action
  // This is done so if other ply gets new loc during keygame or taskbar, the spot wont be reset at end of action
  const restoreSpot = () => {
    if (assignedSpot !== null) return;
    setAssignedSpot(spot);
  };

  const minigameSucces = await Minigames.keygame(2, 2, 10);
  if (!minigameSucces) {
    Notifications.add('Je bent echt slecht hierin...');
    restoreSpot();
    return;
  }

  const [canceled] = await Taskbar.create('shovel', 'Graven', 7500, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
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
  if (canceled) {
    restoreSpot();
    return;
  }

  Events.emitNet('jobs:sanddigging:receive', spot);
};

export const isAtVehicleReturn = () => atVehicleReturn;
export const setAtVehicleReturn = (val: boolean) => {
  atVehicleReturn = val;

  if (atVehicleReturn) {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Wegzetten`);
  } else {
    UI.hideInteraction();
  }
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

export const isEntityAssignedVehicle = (vehicle: number) => {
  if (assignedVehicle === null) return false;
  return NetworkGetEntityFromNetworkId(assignedVehicle) === vehicle;
};

export const getInAssignedVehicle = () => inAssignedVehicle;
export const setInAssignedVehicle = (val: boolean) => {
  inAssignedVehicle = val;

  if (inAssignedVehicle) {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Nieuwe Locatie`);
  } else {
    UI.hideInteraction();
  }
};

export const getIsAtAssignedSpot = () => isAtAssignedSpot;
export const setIsAtAssignedSpot = (atSpot: boolean) => {
  isAtAssignedSpot = atSpot;

  if (isAtAssignedSpot && !IsPedInAnyVehicle(PlayerPedId(), true)) {
    displaySpotInteraction();
  } else {
    UI.hideInteraction();
  }
};

export const displaySpotInteraction = () => {
  if (!isAtAssignedSpot) return;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Graven`);
};

export const checkNewLocation = () => {
  if (!inAssignedVehicle) return;
  setInAssignedVehicle(false);
  Events.emitNet('jobs:sanddigging:assignNewSpot');
};
