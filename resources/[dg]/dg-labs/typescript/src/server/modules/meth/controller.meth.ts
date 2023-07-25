import { Events, RPC, Inventory, Notifications, Util, UI } from '@dgx/server';
import {
  collectMethLoot,
  getStationSettings,
  increaseStationAmount,
  isMethStarted,
  isMethTimedOut,
  isStationFull,
  setStationSettings,
  startMeth,
} from './service.meth';
import { validateLabType } from 'services/labs';
import config from 'services/config';
import { methLogger } from './logger.meth';

Events.onNet('labs:meth:start', (plyId: number, labId: number) => {
  const validated = validateLabType(plyId, labId, 'meth');
  if (!validated) return;

  startMeth(plyId);
});

RPC.register('labs:meth:canDoAction', (plyId, labId: number) => {
  const validated = validateLabType(plyId, labId, 'meth');
  if (!validated) return false;

  return isMethStarted() && !isMethTimedOut();
});

RPC.register('labs:meth:canFillStation', (plyId, labId: number, stationId: number) => {
  const validated = validateLabType(plyId, labId, 'meth');
  if (!validated) return 'notStarted';

  if (!isMethStarted()) return 'notStarted';
  if (isMethTimedOut()) return 'timedOut';

  return isStationFull(stationId) ? 'full' : 'notFull';
});

Events.onNet('labs:meth:increaseStationAmount', (plyId, labId: number, stationId: number) => {
  const validated = validateLabType(plyId, labId, 'meth');
  if (!validated) return;

  increaseStationAmount(plyId, stationId);
});

RPC.register('labs:meth:getStationSettings', (plyId, labId: number, stationId: number) => {
  const validated = validateLabType(plyId, labId, 'meth');
  if (!validated) return;

  return getStationSettings(stationId);
});

Events.onNet(
  'labs:meth:setStationSettings',
  (plyId, labId: number, stationId: number, settings: Labs.Meth.Settings) => {
    const validated = validateLabType(plyId, labId, 'meth');
    if (!validated) return;

    setStationSettings(plyId, stationId, settings);
  }
);

Events.onNet('labs:meth:collect', (plyId, labId: number) => {
  const validated = validateLabType(plyId, labId, 'meth');
  if (!validated) return;

  collectMethLoot(plyId);
});

Inventory.registerUseable<{ createTime: number; amount: number }>('meth_brick', async (plyId, itemState) => {
  const currentTime = Math.round(Date.now() / 1000);
  const dryTime = config.meth.dryTime * 60 * 60;
  if (itemState.metadata.createTime + dryTime > currentTime) {
    Notifications.add(plyId, 'Dit is nog niet droog', 'error');
    return;
  }

  UI.openContextMenu(plyId, [
    {
      title: 'Zak Meth',
      description: `Inhoud: ${itemState.metadata.amount}`,
      disabled: true,
    },
    {
      title: 'Verpakken',
      callbackURL: 'methbrick/unpack',
      data: {
        itemId: itemState.id,
      },
    },
  ]);
});

Events.onNet('labs:meth:unpackBrick', async (plyId, itemId: string) => {
  const cid = Util.getCID(plyId);
  const methBrick = Inventory.getItemStateById(itemId);
  if (!methBrick || methBrick.inventory !== Inventory.concatId('player', cid)) {
    Notifications.add(plyId, 'Je hebt deze meth niet meer opzak', 'error');
    return;
  }

  const removedEmptyBags = await Inventory.removeItemByNameFromPlayer(plyId, 'empty_bags');
  if (!removedEmptyBags) {
    Notifications.add(plyId, 'Waar ga je dit insteken?', 'error');
    return;
  }

  Inventory.destroyItem(methBrick.id);

  const amountOfBags: number = methBrick.metadata.amount;
  if (amountOfBags > 0) {
    Inventory.addItemToPlayer(plyId, 'meth_bag', amountOfBags);
  } else {
    Notifications.add(plyId, 'Dit was van hele slechte kwaliteit');
  }

  const logMsg = `${Util.getName(plyId)}(${plyId}) has made meth brick into bags`;
  methLogger.debug(logMsg);
  Util.Log('labs:meth:useBrick', { itemId: methBrick.id }, logMsg, plyId);
});
