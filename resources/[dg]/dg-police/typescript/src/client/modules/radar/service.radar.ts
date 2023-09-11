import { Util, UI, Notifications, RPC, Sounds, Events } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { isPoliceVehicle } from '@shared/services/vehicles';

let radarEnabled = false; // Keeps key state, does not reflect actual radar visiblity
let radarActive = false; // Reflects visiblity state of radar
let radarThread: NodeJS.Timer | null = null;

let lockedPlate: string | null = null;

const activeData = {
  currentSpeed: 0,
  topSpeed: 0,
  plate: '--------',
  flagged: false,
  veh: 0,
};

const plateHistory: { plate: string; flagged: boolean; time: number }[] = [];

const updateDataToUI = () => {
  const locked = lockedPlate !== null;
  UI.SendAppEvent('policeradar', { ...activeData, locked });
};

export const isRadarEnabled = () => radarEnabled;
export const setRadarEnabled = (enabled: boolean) => {
  const success = setRadarActive(enabled);
  if (!success) return;

  radarEnabled = enabled;
};

export const isRadarActive = () => radarActive;
export const setRadarActive = (active: boolean, skipNotifications = false) => {
  if (!active) {
    clearRadarThread();
    radarActive = false;
    return true;
  }

  const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
  if (!vehicle || !DoesEntityExist(vehicle)) {
    if (!skipNotifications) {
      Notifications.add('Je zit niet in een voertuig', 'error');
    }
    return false;
  }
  if (!isPoliceVehicle(vehicle)) {
    if (!skipNotifications) {
      Notifications.add('Dit is geen politievoertuig', 'error');
    }
    return false;
  }
  if (!GetIsVehicleEngineRunning(vehicle)) {
    if (!skipNotifications) {
      Notifications.add('De motor staat niet aan', 'error');
    }
    return false;
  }

  startRadarThread();
  radarActive = true;
  return true;
};

const clearRadarThread = () => {
  if (radarThread === null) return;
  clearInterval(radarThread);
  radarThread = null;
  UI.closeApplication('policeradar');
};

const startRadarThread = () => {
  clearRadarThread();
  const ped = PlayerPedId();
  UI.openApplication('policeradar');
  updateDataToUI();

  radarThread = setInterval(async () => {
    const vehicle = GetVehiclePedIsIn(ped, false);
    activeData.veh = findTargetVehicle(vehicle);

    if (DoesEntityExist(activeData.veh) && IsEntityAVehicle(activeData.veh)) {
      const targetSpeed = Math.round(GetEntitySpeed(activeData.veh) * 3.6);
      const targetPlate = String(GetVehicleNumberPlateText(activeData.veh));

      // Only update UI speed if we dont have a plate locked or target veh is the locked vehicle
      if (lockedPlate === null || lockedPlate === targetPlate) {
        activeData.currentSpeed = targetSpeed;
      } else if (lockedPlate !== null) {
        activeData.currentSpeed === 0;
      }

      if (targetSpeed > activeData.topSpeed) {
        activeData.topSpeed = targetSpeed;
      }

      // If scanned new vehicle while not having any vehicle locked check if flagged
      if (lockedPlate === null && activeData.plate !== targetPlate) {
        activeData.plate = targetPlate;

        // only do isFlagged RPC call if vehicle has a vin (so no population vehickes)
        let isFlagged = false;
        if (!!Entity(activeData.veh).state.vin) {
          isFlagged = (await RPC.execute<boolean>('police:plateflags:isFlagged', targetPlate)) ?? false;
          if (isFlagged) {
            Sounds.playLocalSound('pager', 0.1);
            activeData.flagged = true;
            lockedPlate = targetPlate;
            Notifications.add('Geflagde nummerplaat is automatisch gelocked');
          }
        }

        plateHistory.unshift({ plate: targetPlate, flagged: isFlagged, time: GetGameTimer() });
        plateHistory.length = 10; // oh no
      }
    } else {
      activeData.currentSpeed = 0;
      activeData.veh = 0;
    }

    updateDataToUI();
  }, 500);
};

const findTargetVehicle = (playerVehicle: number) => {
  const vehicleCoords = Util.getEntityCoords(playerVehicle);
  let forwardCoords = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(playerVehicle, 0, 50, 0));
  const [_, forwardZ] = GetGroundZFor_3dCoord(forwardCoords.x, forwardCoords.y, forwardCoords.z + 500, true);

  if (forwardCoords.z < forwardZ && vehicleCoords.z + 1 > forwardZ) {
    forwardCoords = Vector3.create({ ...forwardCoords, z: forwardCoords.z + 0.5 });
  }
  const handle = StartShapeTestCapsule(
    vehicleCoords.x,
    vehicleCoords.y,
    vehicleCoords.z,
    forwardCoords.x,
    forwardCoords.y,
    forwardCoords.z,
    2.0,
    10,
    playerVehicle,
    7
  );
  const result = GetShapeTestResult(handle);
  return result[4]; // 5th entry in result is hit entity
};

export const lockPlate = () => {
  if (activeData.plate === '--------' || activeData.veh === 0) return;
  if (lockedPlate !== null) {
    lockedPlate = null;
    Notifications.add('Nummerplaat unlocked');
    return;
  }

  lockedPlate = activeData.plate;
  Events.emitNet('police:showVehicleInfo', NetworkGetNetworkIdFromEntity(activeData.veh));
};

export const resetRadar = () => {
  activeData.currentSpeed = 0;
  activeData.topSpeed = 0;
  activeData.plate = '--------';
  activeData.flagged = false;
  activeData.veh = 0;
  lockedPlate = null;
  updateDataToUI();
};

export const openPlateHistory = () => {
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Nummerplaat geschiedenis',
      description: 'Klik op een nummerplaat om te deze kopieren',
      disabled: true,
      icon: 'fas fa-input-numeric',
    },
  ];

  const time = GetGameTimer();
  plateHistory.forEach(x => {
    const minutesSince = Math.ceil((time - x.time) / 60000);
    menu.push({
      title: x.plate,
      description: `${x.flagged ? 'Geflagged' : 'Niet geflagged'} - ${minutesSince} minuten geleden`,
      preventCloseOnClick: true,
      callbackURL: 'police/radar/copyPlate',
      data: {
        plate: x.plate,
      },
    });
  });

  UI.openApplication('contextmenu', menu);
};
