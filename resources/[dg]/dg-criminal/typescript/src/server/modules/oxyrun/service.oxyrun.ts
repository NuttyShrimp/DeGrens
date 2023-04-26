import { Events, Financials, Inventory, Jobs, Notifications, Phone, Police, Util, Vehicles } from '@dgx/server';
import config from 'services/config';
import { oxyrunLogger } from './logger.oxyrun';
import { PHONE_NOTIFICIATION_ID } from './constants.oxyrun';
import { tryCleanBlackMoney } from 'modules/blackmoney/service.blackmoney';

const activeRuns = new Map<string, Criminal.Oxyrun.ActiveRun>();

export const initializeOxyrun = () => {
  const payout = config.oxyrun.jobPayout;
  Jobs.registerJob('oxyrun', {
    title: 'Oxyrun',
    icon: 'pills',
    legal: false,
    size: 1,
    payout,
  });
};

const getRandomLocationId = () => {
  const activeLocationIds = [...activeRuns.values()].reduce((set, a) => set.add(a.locationId), new Set<number>());

  const amountOfLocations = config.oxyrun.locations.length;
  let triesRemaining = amountOfLocations;

  while (triesRemaining-- > 0) {
    const locationId = Math.floor(Math.random() * amountOfLocations);
    if (!activeLocationIds.has(locationId)) {
      return locationId;
    }
  }
};

const buildPhoneNotificationData = (activeRun: Criminal.Oxyrun.ActiveRun) => {
  const title = 'Oxyrun';
  let description = '';

  switch (activeRun.currentStep) {
    case 'pickup':
      description = `Ik heb nog ${activeRun.counter} dozen voor je`;
      break;
    case 'delivery':
      description = `Nog ${activeRun.counter} dozen om te verkopen`;
      break;
  }

  return { title, description };
};

const sendOutStartEventToPlayer = (
  plyId: number,
  activeRun: Criminal.Oxyrun.ActiveRun,
  location: Criminal.Oxyrun.Location
) => {
  Events.emitNet('criminal:oxyrun:buildLocation', plyId, location);
  Phone.showNotification(plyId, {
    ...buildPhoneNotificationData(activeRun),
    id: PHONE_NOTIFICIATION_ID,
    sticky: true,
    keepOnAction: true,
    icon: 'jobcenter',
  });
};

export const startOxyrunForPlayer = (plyId: number) => {
  if (!Util.isDevEnv() && Jobs.isWhitelisted(plyId, 'police')) {
    Notifications.add(plyId, 'Ik kan niks voor jou betekenen');
    return;
  }

  const locationId = getRandomLocationId();
  if (locationId === undefined) {
    Notifications.add(plyId, 'Ik heb momenteel niks voor je beschikbaar', 'error');
    return;
  }

  const location = config.oxyrun.locations[locationId];
  if (!location) return; // should never happen

  const payoutLevel = Jobs.getJobPayoutLevel('oxyrun');
  if (!payoutLevel) return;

  // the changejobofplayergroup function provides phone notifs on why it failed to change
  const changedJob = Jobs.changeJobOfPlayerGroup(plyId, 'oxyrun');
  if (!changedJob) return;

  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return; // should never happen because changeJob checks this but to keep ts happy

  const activeRun: Criminal.Oxyrun.ActiveRun = {
    cid: Util.getCID(plyId),
    locationId,
    currentVin: null,
    currentStep: 'pickup',
    counter: config.oxyrun.deliveriesPerRun,
    payoutLevel,
  };
  activeRuns.set(group.id, activeRun);

  sendOutStartEventToPlayer(plyId, activeRun, location);

  Phone.sendMail(
    plyId,
    'Levering Pillen',
    'Waltuh Blue',
    `Ik heb ${activeRun.counter} dozen voor je, vergeet ze niet!<br><br>Eenmaal aangekomen op de locatie zullen de geinteresseerde kopers zich duidelijk kenbaar maken.<br><br>Leg telkens 1 doos in de koffer van de koper om het te verkopen.<br><br>Veel succes!`
  );

  const logMsg = `${Util.getName(plyId)}(${plyId}) has started an oxyrun`;
  oxyrunLogger.info(logMsg);
  Util.Log(
    'criminal:oxyrun:start',
    {
      locationId,
    },
    logMsg,
    plyId
  );
};

export const restoreOxyrunForPlayer = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const activeRun = activeRuns.get(group.id);
  if (!activeRun) return;

  const location = config.oxyrun.locations[activeRun.locationId];
  if (!location) return; // should never happen

  sendOutStartEventToPlayer(plyId, activeRun, location);

  oxyrunLogger.debug(`oxyrun has been restored for ${Util.getName(plyId)}(${plyId})`);
};

export const handleOxyrunGroupLeave = (plyId: number | null, groupId: string) => {
  const activeRun = activeRuns.get(groupId);
  if (!activeRun) return;

  activeRuns.delete(groupId);

  if (plyId) {
    Events.emitNet('criminal:oxyrun:cleanup', plyId);
    Phone.removeNotification(plyId, PHONE_NOTIFICIATION_ID);
  }

  const logMsg = `oxyrun for group ${groupId} has been finished because owner left group`;
  oxyrunLogger.info(logMsg);
  Util.Log(
    'criminal:oxyrun:finish',
    {
      ...activeRun,
    },
    logMsg
  );
};

export const registerOxyrunVehicle = (plyId: number, netId: number): boolean => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return false;

  const activeRun = activeRuns.get(group.id);
  if (!activeRun) return false;
  if (activeRun.currentStep !== 'delivery') return false;

  const vin = Vehicles.getVinForNetId(netId);
  if (!vin) return false;

  if (activeRun.counter <= 0) return false;

  activeRun.currentVin = vin;

  oxyrunLogger.debug(`${Util.getName(plyId)}(${plyId}) has registered (${vin}) as oxyrun buyer`);

  return true;
};

export const giveOxyrunBoxToPlayer = async (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const activeRun = activeRuns.get(group.id);
  if (!activeRun) return;

  if (activeRun.currentStep !== 'pickup' || activeRun.counter <= 0) {
    Notifications.add(plyId, 'Je hebt alle dozen al opgehaald', 'error');
    return;
  }

  const hasObject = await Inventory.hasObject(plyId);
  if (hasObject) {
    Notifications.add(plyId, 'Je hebt nog iets vast', 'error');
    return;
  }

  activeRun.counter--;
  Inventory.addItemToPlayer(plyId, 'oxyrun_box', 1);

  if (activeRun.counter <= 0) {
    activeRun.currentStep = 'delivery';
    activeRun.counter = config.oxyrun.deliveriesPerRun;
  }

  Phone.updateNotification(plyId, PHONE_NOTIFICIATION_ID, buildPhoneNotificationData(activeRun));

  oxyrunLogger.debug(`${Util.getName(plyId)}(${plyId}) has taken an oxyrun box`);
};

export const sellOxyToBuyer = async (plyId: number, vin: string, itemState: Inventory.ItemState) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const activeRun = activeRuns.get(group.id);
  if (!activeRun) return;
  if (activeRun.currentStep !== 'delivery') return;

  if (activeRun.currentVin !== vin) {
    Notifications.add(plyId, 'Dit is niet de koper', 'error');
    return;
  }

  if (!activeRun.counter) return;

  const removed = await Inventory.removeItemByIdFromInventory('trunk', vin, itemState.id);
  if (!removed) return;

  activeRun.currentVin = null;
  activeRun.counter--;

  if (Util.getRndInteger(0, 101) < config.oxyrun.receiveOxyChance) {
    Inventory.addItemToPlayer(plyId, 'oxy_pills', 1);
  } else {
    const payout = Jobs.getJobPayout('oxyrun', group.size, activeRun.payoutLevel);
    if (payout !== null) {
      Financials.addCash(plyId, payout, 'oxyrun-sale');
    }
  }

  const enoughPoliceForCleaning = Police.canDoActivity('oxyrun');
  if (enoughPoliceForCleaning) {
    tryCleanBlackMoney(plyId, 'oxyrun');
  }

  const isFinished = activeRun.counter <= 0;
  Events.emitNet('criminal:oxyrun:finishSale', plyId, isFinished);

  if (isFinished) {
    Jobs.disbandGroup(group.id);
  } else {
    Phone.updateNotification(plyId, PHONE_NOTIFICIATION_ID, buildPhoneNotificationData(activeRun));
  }

  if (Util.getRndInteger(0, 101) < config.oxyrun.dispatchChance) {
    Police.createDispatchCall({
      tag: '10-31',
      title: 'Verdachte verkoop',
      description: 'Een voorbijganger meldt een mogelijks illegale verkoop',
      coords: Util.getPlyCoords(plyId),
      criminal: plyId,
      blip: {
        sprite: 51,
        color: 0,
      },
    });
  }

  const logMsg = `${Util.getName(plyId)}(${plyId}) has sold oxy to a buyer`;
  oxyrunLogger.silly(logMsg);
  Util.Log(
    'criminal:oxyrun:sell',
    {
      vin,
      itemId: itemState.id,
    },
    logMsg,
    plyId
  );
};

export const resetOxyrunVehicle = (plyId: number) => {
  const group = Jobs.getGroupByServerId(plyId);
  if (!group) return;

  const activeRun = activeRuns.get(group.id);
  if (!activeRun) return;

  if (activeRun.currentStep !== 'delivery') return;

  activeRun.currentVin = null;

  oxyrunLogger.debug(`vehicle has been reset for oxyrun of ${Util.getName(plyId)}(${plyId})`);
};
