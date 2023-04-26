import { BlipManager, Events, Notifications, PolyZone, RPC, Sync, Util } from '@dgx/client';

let doingOxyRun = false;
let atLocation = false;
let buyerVehicle: number | null = null;
let buyerVehicleThread: NodeJS.Timer | null = null;

const vehiclesSoldTo = new Set<number>();

export const isDoingOxyRun = () => doingOxyRun;

export const buildLocationZone = (location: Criminal.Oxyrun.Location) => {
  if (doingOxyRun) return;

  doingOxyRun = true;
  PolyZone.addBoxZone('oxyrun_location', location.center, location.width, location.length, {
    ...location.options,
    data: {},
    routingBucket: 0,
  });

  BlipManager.addBlip({
    id: 'location',
    category: 'oxyrun',
    coords: location.center,
    sprite: 51,
    color: 5,
    scale: 1.1,
    isShortRange: true,
    text: 'Verkooplocatie',
  });
};

export const destroyLocationZone = () => {
  doingOxyRun = false;
  PolyZone.removeZone('oxyrun_location');
  BlipManager.removeCategory('oxyrun');
};

export const handleEnterLocation = () => {
  if (!doingOxyRun || atLocation) return;

  atLocation = true;
  scheduleFindBuyer();
  Notifications.add('Je bent aangekomen op de verkoopplaats', 'success');
};

export const handleLeaveLocation = () => {
  if (!doingOxyRun || !atLocation) return;

  atLocation = false;
  Notifications.add('Je hebt de verkoopplaats verlaten', 'error');
};

const scheduleFindBuyer = async () => {
  await Util.Delay(500);

  if (!doingOxyRun || !atLocation) return;

  const vehicle = getVehicleAtLocation();
  if (!vehicle) {
    scheduleFindBuyer();
    return;
  }

  vehiclesSoldTo.add(vehicle);

  const success = await RPC.execute<boolean>('criminal:oxyrun:registerVehicle', NetworkGetNetworkIdFromEntity(vehicle));
  if (!success) {
    scheduleFindBuyer();
    return;
  }

  buyerVehicle = vehicle;
  Sync.executeAction('oxyrun:doVehicleAction', vehicle);

  buyerVehicleThread = setInterval(() => {
    if (
      doingOxyRun &&
      buyerVehicle &&
      DoesEntityExist(buyerVehicle) &&
      PolyZone.isPointInside(Util.getEntityCoords(buyerVehicle), 'oxyrun_location')
    )
      return;

    Events.emitNet('criminal:oxyrun:resetVehicle');
    buyerVehicle = null;
    scheduleFindBuyer();

    if (buyerVehicleThread) {
      clearInterval(buyerVehicleThread);
    }

    if (Util.isDevEnv()) {
      console.log(`[Oxyrun] Vehicle has been reset`);
    }
  }, 100);
};

const getVehicleAtLocation = () => {
  const vehicles: number[] = GetGamePool('CVehicle');

  for (const vehicle of vehicles) {
    if (vehiclesSoldTo.has(vehicle)) continue;

    // ensure vehicle is networked with running engine but not a ply vehicle
    if (
      !DoesEntityExist(vehicle) ||
      !NetworkGetEntityIsNetworked(vehicle) ||
      IsEntityAMissionEntity(vehicle) ||
      !GetIsVehicleEngineRunning(vehicle)
    )
      continue;

    const vehicleCoords = Util.getEntityCoords(vehicle);
    if (!PolyZone.isPointInside(vehicleCoords, 'oxyrun_location')) continue;

    return vehicle;
  }
};

export const cleanupOxyrun = () => {
  destroyLocationZone();
};

export const finishBuyer = (finishedJob: boolean) => {
  if (buyerVehicle === null) return;

  Notifications.add(finishedJob ? 'Je hebt alle dozen verkocht!' : 'Je hebt een doos verkocht', 'info');

  Sync.executeAction('oxyrun:clearVehicle', buyerVehicle);

  if (buyerVehicleThread) {
    clearInterval(buyerVehicleThread);
  }
  buyerVehicle = null;

  if (!finishedJob) {
    setTimeout(() => {
      scheduleFindBuyer();
    }, 15000);
  } else {
    cleanupOxyrun();
  }
};
