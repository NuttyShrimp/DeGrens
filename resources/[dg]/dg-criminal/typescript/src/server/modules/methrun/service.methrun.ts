import {
  Events,
  Financials,
  Inventory,
  Jobs,
  Notifications,
  Npcs,
  Police,
  Taskbar,
  UI,
  Util,
  Vehicles,
} from '@dgx/server';
import config from 'services/config';
import { charModule } from 'services/core';
import { methrunLogger } from './logger.methrun';
import {
  chooseGuardData,
  generateMethRunDefaultState,
  methrunLoggerWrapper,
  sendErrorToClient,
  sendMethRunMail,
} from './helpers.methrun';
import { getMaxCornersellPriceOfItem } from 'modules/cornerselling/service.cornerselling';

let awaitingCall: string | null = null;
let activeRun: Criminal.Methrun.ActiveRun | null = null;

let inTimeout = false;

export const initializeMethRun = () => {
  Inventory.createScriptedStash('methrun_dropoff', 6, ['meth_brick']);
  methrunLogger.info('Initialized');
};

export const payForMethRun = async (plyId: number) => {
  const hasJob = !!Jobs.getCurrentJob(plyId);
  if (hasJob) {
    Notifications.add(plyId, 'Ik vertrouw jou niet!', 'error');
    return;
  }

  if (activeRun !== null || awaitingCall !== null || inTimeout) {
    Notifications.add(plyId, 'Ik ben momenteel druk bezig', 'error');
    return;
  }

  if (!Police.canDoActivity('methrun')) {
    Notifications.add(plyId, 'Er is momenteel niet genoeg interesse', 'error');
    return;
  }

  const initialPayment = config.methrun.initialPayment;
  const paymentSuccess = await Financials.cryptoRemove(plyId, initialPayment.crypto, initialPayment.amount);
  if (!paymentSuccess) {
    Notifications.add(plyId, 'Je hebt niet genoeg om me te betalen', 'error');
    return;
  }

  awaitingCall = await charModule.generatePhone(true);
  Inventory.addItemToPlayer(plyId, 'paper_note', 1, { nummer: awaitingCall });
  if (Util.isDevEnv()) {
    UI.addToClipboard(plyId, awaitingCall);
  }

  methrunLoggerWrapper(
    plyId,
    'info',
    'pay',
    `has paid ${initialPayment.amount} ${initialPayment.crypto} for a meth run (${awaitingCall})`,
    {
      phoneNr: awaitingCall,
    }
  );
};

export const handleAnonCall = (plyId: number, phoneNumber: string) => {
  if (awaitingCall !== phoneNumber) return;

  awaitingCall = null;
  startMethRun(plyId);
};

const randomizeRunData = (): Pick<
  Criminal.Methrun.ActiveRun,
  'finishLocation' | 'vehicleLocation' | 'dropOffLocation'
> => {
  const finishLocationIdx = Math.floor(Math.random() * config.methrun.finishLocations.length);
  const vehicleLocationIdx = Math.floor(Math.random() * config.methrun.vehicleLocations.length);
  const dropOffLocationIdx = Math.floor(Math.random() * config.methrun.dropOffLocations.length);

  return {
    finishLocation: config.methrun.finishLocations[finishLocationIdx],
    vehicleLocation: config.methrun.vehicleLocations[vehicleLocationIdx],
    dropOffLocation: config.methrun.dropOffLocations[dropOffLocationIdx],
  };
};

const startMethRun = async (plyId: number) => {
  if (activeRun !== null) return;

  activeRun = {
    startCID: Util.getCID(plyId),
    ...randomizeRunData(),
    state: generateMethRunDefaultState(),
    playersInVehicleZone: new Set(),
    vehicle: {
      vin: null,
      trackerId: null,
    },
    methAmount: -1,
    itemId: null,
    guards: {
      amountLeftToSpawn: config.methrun.amountOfGuards,
      amountLeftToKill: Math.floor(config.methrun.amountOfGuards * 0.85), // give a bit of leeway if some guards cannot be found
      interval: null,
    },
  };

  Npcs.add({
    id: `methrun_dropoff`,
    model: 'g_m_y_azteca_01',
    position: activeRun.dropOffLocation,
    distance: 100.0,
    settings: {
      invincible: true,
      ignore: true,
      freeze: true,
      collision: true,
    },
    flags: {
      isMethRunDropOff: true,
    },
  });

  methrunLoggerWrapper(plyId, 'info', 'start', `has started a meth run`);

  setTimeout(() => {
    if (!activeRun) return;
    sendMethRunMail(
      activeRun.startCID,
      'Alles is geregeld.<br>De GPS locatie zit bij dit bericht. Ga daar je spullen afleveren.',
      activeRun.dropOffLocation
    );
  }, 2000);
};

export const handleItemAddedToDropOffStash = (itemId: string, originalInventory: string) => {
  if (!activeRun) return;

  const itemState = Inventory.getItemStateById<{ amount: number }>(itemId);
  if (!itemState || itemState.inventory !== originalInventory) return; // item got removed manually during timeout

  // dont destroy to be able to refund easily
  Inventory.moveItemToInventory('stash', 'methrun_backup', itemId);
  if (activeRun.methAmount === -1) {
    activeRun.methAmount = 0;
  }
  activeRun.methAmount += itemState.metadata?.amount ?? 0;

  methrunLoggerWrapper(undefined, 'silly', 'addToDropOff', `a methbrick has been added to methrun dropoff`, { itemId });
};

export const confirmMethRunDropOff = (plyId: number) => {
  if (!activeRun) return;

  if (activeRun.state.dropOffFinished) {
    Notifications.add(plyId, 'Ik heb je spullen al ontvangen', 'error');
    return;
  }

  if (activeRun.methAmount === -1) {
    Notifications.add(plyId, 'Ik heb nog niks van je gekregen', 'error');
    return;
  }

  activeRun.state.dropOffFinished = true;

  sendMethRunMail(
    [Util.getCID(plyId), activeRun.startCID],
    'Ik heb de spullen ontvangen. Ik zal ze verwerken en je een bericht sturen wanneer ze klaar zijn.'
  );

  methrunLoggerWrapper(plyId, 'info', 'confirmDropOff', `has confirmed a meth run dropoff`, {
    methAmount: activeRun.methAmount,
  });

  setTimeout(() => {
    if (!activeRun) return;
    Npcs.remove('methrun_dropoff');
    buildVehicleZone();
    sendMethRunMail(
      [Util.getCID(plyId), activeRun.startCID],
      'De spullen die je me gegeven hebt zijn verwerkt. Op de GPS locatie dat bij dit bericht zit staat een voertuig te wachten met het verwerkt materiaal in de kofferbak.',
      activeRun.vehicleLocation.spawn
    );
  }, (Util.isDevEnv() ? 1 : config.methrun.delayAfterDropOff) * 1000);
};

const buildVehicleZone = () => {
  if (!activeRun || activeRun.state.vehicleZoneBuilt) return;

  activeRun.state.vehicleZoneBuilt = true;
  Events.emitNet('criminal:methrun:buildVehicleZone', -1, activeRun.vehicleLocation.zone);
};

const destroyVehicleZone = () => {
  if (!activeRun || !activeRun.state.vehicleZoneBuilt) return;

  methrunLogger.debug(`Destroying vehicle zone`);
  activeRun.state.vehicleZoneBuilt = false;
  Events.emitNet('criminal:methrun:destroyVehicleZone', -1);
};

export const handleEnterMethRunVehicleZone = (plyId: number) => {
  if (!activeRun) return;

  activeRun.playersInVehicleZone.add(plyId);

  spawnMethRunVehicle(plyId);
  startGuardSpawningThread();

  methrunLogger.debug(`${plyId} has entered the methrun vehicle zone`);
};

export const handleLeaveMethRunVehicleZone = (plyId: number) => {
  if (!activeRun) return;

  activeRun.playersInVehicleZone.delete(plyId);

  if (activeRun.playersInVehicleZone.size === 0) {
    stopGuardSpawningThread();
  }

  methrunLogger.debug(`${plyId} has left the methrun vehicle zone`);
};

const spawnMethRunVehicle = async (plyId: number) => {
  if (!activeRun || activeRun.state.vehicleSpawned) return;

  activeRun.state.vehicleSpawned = true;

  const model = config.methrun.vehicleModels[Math.floor(Math.random() * config.methrun.vehicleModels.length)];
  const spawnedVehicle = await Vehicles.spawnVehicle({
    model,
    position: activeRun.vehicleLocation.spawn,
    upgrades: {
      primaryColor: 0,
      armor: 4,
      bulletProofTires: true,
    },
    fuel: 15,
    doorsLocked: true,
  });
  if (!spawnedVehicle) {
    methrunLogger.error('Failed to spawn vehicle');
    sendErrorToClient(plyId);
    return;
  }

  activeRun.vehicle.vin = spawnedVehicle.vin;
  Vehicles.blockVinInBennys(spawnedVehicle.vin);
  Vehicles.setVehicleCannotBeLockpicked(spawnedVehicle.vin, true, 'Het is nog niet veilig genoeg');

  if (!activeRun.itemId) {
    const itemIds = await Inventory.addItemToInventory('trunk', spawnedVehicle.vin, 'processed_meth', 1);
    activeRun.itemId = itemIds[0];
  } else {
    methrunLogger.error('Active Run already has an item id assigned');
    sendErrorToClient(plyId);
  }

  methrunLoggerWrapper(plyId, 'info', 'spawnedVehicle', `has triggered a methrun vehicle spawn`, {
    model,
    vin: spawnedVehicle.vin,
    itemId: activeRun.itemId,
  });
};

const startGuardSpawningThread = () => {
  if (!activeRun || activeRun.guards.interval || activeRun.guards.amountLeftToSpawn <= 0) return;

  const guardLocations = activeRun?.vehicleLocation.guards;
  if (!guardLocations) return;

  const lastGuardLocationsIdx: number[] = [];

  const spawnInterval = setInterval(() => {
    if (!activeRun) {
      clearInterval(spawnInterval);
      return;
    }

    let guardLocationIdx = 0;
    let tries = guardLocations.length; // failsafe to prevent infinite loop
    while (tries > 0) {
      tries--;
      guardLocationIdx = Math.floor(Math.random() * guardLocations.length);
      if (!lastGuardLocationsIdx.includes(guardLocationIdx)) break;
    }

    // keep last 3 spawn locations in memory to prevent spawning at the same location
    lastGuardLocationsIdx.push(guardLocationIdx);
    lastGuardLocationsIdx.length = 3;

    Npcs.spawnGuard({
      ...chooseGuardData(),
      position: guardLocations[guardLocationIdx],
      deleteTime: {
        dead: 5,
        alive: 300,
      },
      onDeath: handleGuardDied,
    });

    methrunLogger.debug(`Spawned guard`);
    activeRun.guards.amountLeftToSpawn--;

    if (activeRun.guards.amountLeftToSpawn === 0) {
      stopGuardSpawningThread();
      return;
    }
  }, 3000);

  activeRun.guards.interval = spawnInterval;
};

const stopGuardSpawningThread = () => {
  if (!activeRun?.guards.interval) return;

  clearInterval(activeRun.guards.interval);
  activeRun.guards.interval = null;
};

const handleGuardDied = () => {
  if (!activeRun?.vehicle.vin || activeRun.guards.amountLeftToKill <= 0) return;

  activeRun.guards.amountLeftToKill--;
  methrunLogger.debug(`Guard killed, ${activeRun.guards.amountLeftToKill} left`);

  if (activeRun.guards.amountLeftToKill > 0) return;

  methrunLogger.debug(`All guards killed, unlocking vehicle`);
  Vehicles.setVehicleCannotBeLockpicked(activeRun.vehicle.vin, false);
};

export const handleLockpickMethRunVehicle = (plyId: number, vehicle: number) => {
  if (!activeRun || activeRun.vehicle.vin === null || activeRun.state.vehicleLockpicked) return;

  const methrunVehicle = Vehicles.getVehicleOfVin(activeRun.vehicle.vin);
  if (methrunVehicle !== vehicle) return;

  destroyVehicleZone();

  activeRun.state.vehicleLockpicked = true;
  sendMethRunMail(
    [Util.getCID(plyId), activeRun.startCID],
    'De locatie was onderschept door een vijandige bende. Ze hebben een tracker geplaatst op het voertuig.<br><br>Het materiaal zit gelukkig nog in het voertuig. Blijf uit de handen van de politie terwijl ik de tracker probeer te verwijderen.'
  );
  activeRun.vehicle.trackerId = Police.addTrackerToVehicle(methrunVehicle, 5000);
  Police.createDispatchCall({
    title: 'Drugsvoertuig onderschept',
    description:
      'Melding van crimineel conflict met schoten waarbij een drugsgerelateerd voertuig is gestolen. Actuele tracker te vinden op GPS',
    vehicle: methrunVehicle,
    criminal: plyId,
    coords: Util.getEntityCoords(methrunVehicle),
    important: true,
    tag: '10-91',
  });

  methrunLoggerWrapper(plyId, 'info', 'lockpick', `has lockpicked the methrun vehicle`, { vin: activeRun.vehicle.vin });

  setTimeout(() => {
    removeMethRunVehicleTracker();
  }, (Util.isDevEnv() ? 1 : config.methrun.trackerTime) * 60 * 1000);
};

const removeMethRunVehicleTracker = () => {
  if (!activeRun || activeRun.vehicle.vin === null) return;

  const methrunVehicle = Vehicles.getVehicleOfVin(activeRun.vehicle.vin);
  if (!methrunVehicle || !DoesEntityExist(methrunVehicle)) return;

  if (activeRun.vehicle.trackerId) {
    Police.removeTrackerFromVehicle(activeRun.vehicle.trackerId);
  }

  activeRun.state.trackerRemoved = true;

  const mailTargets = [activeRun.startCID];
  const driverPed = GetPedInVehicleSeat(methrunVehicle, -1);
  if (driverPed && DoesEntityExist(driverPed)) {
    const driverPly = NetworkGetEntityOwner(driverPed);
    if (driverPly !== -1 && driverPly) {
      mailTargets.push(Util.getCID(driverPly));
    }
  }

  sendMethRunMail(
    mailTargets,
    'De tracker is verwijderd.<br>Je kan het voertuig nu veilig naar de drop-off locatie brengen. Neem geen politie mee of de koper zal afgeschrikt worden',
    activeRun.finishLocation
  );

  Npcs.add({
    id: `methrun_finish`,
    model: 'g_m_y_azteca_01',
    position: activeRun.finishLocation,
    distance: 100.0,
    settings: {
      invincible: true,
      ignore: true,
      freeze: true,
      collision: true,
    },
    flags: {
      isMethRunFinish: true,
    },
  });

  methrunLoggerWrapper(undefined, 'info', 'removeTracker', `tracker has been removed off methrun vehicle`, {
    vin: activeRun.vehicle.vin,
  });
};

export const finishMethRun = async (plyId: number) => {
  if (!activeRun) return;
  if (!activeRun?.itemId || !activeRun?.vehicle.vin) return;
  if (!activeRun.state.trackerRemoved) return;

  if (Police.isAnyPoliceInRange(activeRun.finishLocation, 50.0)) {
    Notifications.add(plyId, 'Er is politie in de buurt, kom terug wanneer ze weg zijn', 'error');
    return;
  }

  const vehicle = Vehicles.getVehicleOfVin(activeRun.vehicle.vin);
  if (!vehicle) return;

  if (Util.getEntityCoords(vehicle).distance(activeRun.finishLocation) > 15.0) {
    Notifications.add(plyId, 'Je bent hier niet met het voertuig', 'error');
    return;
  }

  const hasItem = await Inventory.doesInventoryHaveItemWithId('trunk', activeRun.vehicle.vin, activeRun.itemId);
  if (!hasItem) {
    Notifications.add(plyId, 'Het materiaal zit niet meer in de koffer');
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'handshake', 'Afgeven', Util.isDevEnv() ? 5000 : 60000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  if (Util.getEntityCoords(vehicle).distance(activeRun.finishLocation) > 15.0) {
    Notifications.add(plyId, 'Je bent hier niet met het voertuig', 'error');
    return;
  }

  const removed = await Inventory.removeItemByIdFromInventory('trunk', activeRun.vehicle.vin, activeRun.itemId);
  if (!removed) {
    Notifications.add(plyId, 'Het materiaal zit niet meer in de koffer');
    return;
  }

  const pricePer = getMaxCornersellPriceOfItem('meth_bag');
  const price = Math.round(activeRun.methAmount * pricePer * config.methrun.pricePercentage);

  Vehicles.deleteVehicle(vehicle);
  Financials.addCash(plyId, price, 'methrun_payout');
  sendMethRunMail([activeRun.startCID, Util.getCID(plyId)], `Het was goed zaken met je te doen`);
  Inventory.clearInventory('stash', 'stash__methrun_backup');

  methrunLoggerWrapper(plyId, 'info', 'finish', `has finished the methrun for ${price}`, {
    price,
    activeRun,
  });

  activeRun = null;
  inTimeout = true;

  setTimeout(() => {
    inTimeout = false;
    Npcs.remove('methrun_finish');
    methrunLoggerWrapper(undefined, 'info', 'reset', `methrun timeout has been reset`);
  }, (Util.isDevEnv() ? config.methrun.timeoutBetweenRuns * 60 : 10) * 1000);
};

export const initMethRunForPlayer = (plyId: number) => {
  if (activeRun === null) return;

  if (activeRun.state.vehicleZoneBuilt) {
    Events.emitNet('criminal:methrun:buildVehicleZone', plyId, activeRun.vehicleLocation.zone);
  }
};
