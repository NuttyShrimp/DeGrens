import { deepCopy } from 'helpers';
import config from '../../services/config';
import { Inventory, Minigames, Notifications, Police, Sounds, Taskbar, Util } from '@dgx/server';
import { DEFAULT_METH_STATE } from './constants.meth';
import { generateRecipe, map } from './helpers.meth';
import { methLogger } from './logger.meth';

let methState: Labs.Meth.State = deepCopy(DEFAULT_METH_STATE);
let amountOfStations = -1;

export const setAmountOfMethStations = () => {
  amountOfStations = config.interiors.meth.peekZones.reduce((acc, cur) => acc + (cur.action === 'station' ? 1 : 0), 0);
  loadDefaultStations();
};

const loadDefaultStations = () => {
  for (let i = 0; i < amountOfStations; i++) {
    methState.stations[i] = {
      amount: 0,
      settings: {
        amount: [0, 100],
        power: [0, 100],
      },
    };
  }
};

const getStation = (stationId: number) => {
  if (stationId > amountOfStations - 1)
    throw new Error(`Tried to get station with id ${stationId} but max was ${amountOfStations - 1}`);

  const station = methState.stations[stationId];
  if (!station) throw new Error(`Tried to get station with id ${stationId} but was not found`);

  return station;
};

const areAllStationsFull = () => {
  if (amountOfStations === -1) return false;
  for (let i = 0; i < amountOfStations; i++) {
    const station = getStation(i);
    if (station.amount < config.meth.fillAmount) return false;
  }
  return true;
};

// checks if started and not in timeout
export const isMethStarted = () => {
  return methState.started && !methState.timedOut;
};

export const startMeth = async (plyId: number) => {
  if (!Police.canDoActivity('labs_meth')) {
    Notifications.add(plyId, 'Dit werkt momenteel niet', 'error');
    return;
  }

  if (isMethStarted()) {
    Notifications.add(plyId, 'Dit staat al aan', 'error');
    return;
  }

  // set as started to avoid multiple at same time
  methState.started = true;

  const itemState = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'meth_lab_keycard');
  if (!itemState) {
    Notifications.add(plyId, 'Je mist iets', 'error');
    methState.started = false;
    return;
  }

  const [canceled] = await Taskbar.create(plyId, 'power-off', 'Aanzetten...', 10000, {
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
    animation: {
      animDict: 'anim@heists@prison_heiststation@cop_reactions',
      anim: 'cop_b_idle',
      flags: 16,
    },
  });
  if (canceled) {
    methState.started = false;
    return;
  }

  // they always lose keycard, whether success or not
  const removed = await Inventory.removeItemByIdFromPlayer(plyId, itemState.id);
  if (!removed) {
    Notifications.add(plyId, 'Je mist iets', 'error');
    methState.started = false;
    return;
  }

  const minigameConfig = config.meth.hack;
  const success = await Minigames.sequencegame(
    plyId,
    minigameConfig.gridSize,
    minigameConfig.length,
    minigameConfig.time
  );

  Util.changePlayerStress(plyId, 10);

  if (!success) {
    Notifications.add(plyId, 'Keycard is beschadigd...', 'error');
    methState.started = false;
    return;
  }

  methState.started = true;
  methState.startCid = Util.getCID(plyId);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has started meth creation`;
  methLogger.info(logMsg);
  Util.Log('labs:meth:start', {}, logMsg, plyId);
};

export const isStationFull = (stationId: number) => {
  const station = getStation(stationId);
  return station.amount >= config.meth.fillAmount;
};

export const increaseStationAmount = (plyId: number, stationId: number) => {
  if (!isMethStarted()) return;
  if (isStationFull(stationId)) return;

  const station = getStation(stationId);
  station.amount++;

  const logMsg = `${Util.getName(plyId)}(${plyId}) has increased meth station ${stationId} amount`;
  methLogger.debug(logMsg);
  Util.Log('labs:meth:increaseStation', { station }, logMsg, plyId);
};

export const getStationSettings = (stationId: number) => {
  const station = getStation(stationId);
  return station.settings;
};

export const setStationSettings = (plyId: number, stationId: number, settings: Labs.Meth.Settings) => {
  if (!isMethStarted()) return;

  const station = getStation(stationId);
  station.settings = settings;

  const logMsg = `${Util.getName(plyId)}(${plyId}) has changed meth station ${stationId} settings`;
  methLogger.debug(logMsg);
  Util.Log('labs:meth:increaseStation', { station }, logMsg, plyId);
};

export const collectMethLoot = async (plyId: number) => {
  if (!isMethStarted() || !areAllStationsFull()) {
    Notifications.add(plyId, 'Er is nog niks te nemen', 'error');
    return;
  }

  const strain = getRecipeStrain();
  const amount = Math.floor(Math.ceil(strain / 20) ** 2 * 3); // expontential amount bawed on strain

  const currentTime = Math.round(Date.now() / 1000);
  Inventory.addItemToPlayer(plyId, 'meth_brick', 1, {
    hiddenKeys: ['createTime', 'amount'],
    createTime: currentTime,
    amount,
  });
  methState.timedOut = true;

  const timeout = config.meth.resetTime * 60 * 1000;
  setTimeout(() => {
    methState = deepCopy(DEFAULT_METH_STATE);
    loadDefaultStations();

    const logMsg = `Lab has been reset`;
    methLogger.info(logMsg);
    Util.Log('labs:meth:reset', {}, logMsg);
  }, timeout);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has collected meth`;
  methLogger.debug(logMsg);
  Util.Log('labs:meth:increaseStation', { strain, amount }, logMsg, plyId);
};

const getRecipeStrain = () => {
  let strain = 0;

  const recipe = generateRecipe(methState.startCid);

  for (let stationId = 0; stationId < methState.stations.length; stationId++) {
    const recipeForStation = recipe[stationId];
    const settings = methState.stations[stationId].settings;

    for (const key of Object.keys(recipeForStation) as (keyof typeof recipeForStation)[]) {
      const targetValue = recipeForStation[key];
      const setting = settings[key];

      // smaller selector means higher strain increase when targetvalue is in selector
      // if targetvalue not in selector, no gain for that selector
      if (targetValue > setting[0] && targetValue < setting[1]) {
        // calculate size but map to diff minmax so smallest selector is 0 and biggest is 100
        const size = map(setting[1] - setting[0], 10, 100, 0, 100);
        const decrease = Math.ceil(size / 10);
        strain += 10 - decrease;
      }
    }
  }

  return strain;
};

export const debugMethState = () => {
  console.log(methState);
};
