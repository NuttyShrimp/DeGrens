import { BlipManager, Notifications, PolyZone, RPC, Sync, Util } from '@dgx/client';
import { doHornJingleForVehicle } from './helpers.oxyrun';

let doingOxyRun = false;
let atLocation = false;
let buyerVehicle: number | null = null;
let buyerVehicleThread: NodeJS.Timer | null = null;
let inSchedulingTimeout = false;

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

export const cleanupOxyrun = () => {
  doingOxyRun = false;
  clearBuyerVehicleThread();
  PolyZone.removeZone('oxyrun_location');
  BlipManager.removeCategory('oxyrun');
};

export const handleEnterLocation = () => {
  if (!doingOxyRun || atLocation) return;

  atLocation = true;
  Notifications.add('Je bent aangekomen op de verkoopplaats', 'success');

  if (!inSchedulingTimeout) {
    scheduleFindBuyer();
  }

  global.exports['dg-misc'].overrideDensitySettings({
    vehicle: 1.0,
  });
};

export const handleLeaveLocation = () => {
  if (!doingOxyRun || !atLocation) return;

  atLocation = false;
  Notifications.add('Je hebt de verkoopplaats verlaten', 'error');

  global.exports['dg-misc'].resetDensitySettings();
};

const scheduleFindBuyer = async () => {
  await Util.Delay(500);

  if (!doingOxyRun || !atLocation || buyerVehicle !== null) return;

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
  doHornJingleForVehicle(vehicle); // is not networked but only choosing player needs to hear it anyway

  clearBuyerVehicleThread();

  buyerVehicleThread = setInterval(() => {
    if (!doingOxyRun) return;

    if (!buyerVehicle) {
      clearBuyerVehicleThread();
      console.error(`[Oxyrun] buyerVehicle variable was somehow changed`);
      return;
    }

    // if buyervehicle got removed or is not at location anymore, reset vehicle and find another buyer
    if (
      !DoesEntityExist(buyerVehicle) ||
      !PolyZone.isPointInside(Util.getEntityCoords(buyerVehicle), 'oxyrun_location')
    ) {
      clearBuyerVehicleThread();
      buyerVehicle = null;

      RPC.execute<boolean>('criminal:oxyrun:resetVehicle').then(success => {
        if (!success) return;
        scheduleFindBuyer();
      });

      if (Util.isDevEnv()) {
        console.log(`[Oxyrun] Vehicle has been reset`);
      }
    }
  }, 100);
};

const clearBuyerVehicleThread = () => {
  if (buyerVehicleThread === null) return;
  clearInterval(buyerVehicleThread);
  buyerVehicleThread = null;
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

    const driver = GetPedInVehicleSeat(vehicle, -1);
    if (!DoesEntityExist(driver) || IsPedAPlayer(driver)) continue;

    return vehicle;
  }
};

export const finishBuyer = (finishedJob: boolean) => {
  if (buyerVehicle === null) return;

  Notifications.add(finishedJob ? 'Je hebt alle dozen verkocht!' : 'Je hebt een doos verkocht', 'info');

  Sync.executeAction('oxyrun:clearVehicle', buyerVehicle);

  clearBuyerVehicleThread();
  buyerVehicle = null;

  if (!finishedJob) {
    inSchedulingTimeout = true;
    setTimeout(() => {
      scheduleFindBuyer();
      inSchedulingTimeout = false;
    }, 15000);
  } else {
    cleanupOxyrun();
  }
};
