import { Events, Inventory, Minigames, Notifications, Peek, RPC, Util } from '@dgx/client';
import locationManager from 'controllers/classes/LocationManager';

Peek.addZoneEntry(
  'store_safe',
  {
    options: [
      {
        icon: 'fas fa-hdd',
        label: 'Hack',
        items: 'decoding_tool',
        action: () => {
          hackSafe();
        },
        canInteract: () => {
          const requiredCops = 1;
          const enoughCops = global.exports['qb-policejob'].getAmountOfCops() >= requiredCops;
          return locationManager.currentStore !== null && enoughCops;
        },
      },
      {
        icon: 'fas fa-hand-holding-usd',
        label: 'Neem',
        action: () => {
          lootSafe();
        },
        canInteract: () => {
          return locationManager.currentStore !== null;
        },
      },
    ],
    distance: 1.2,
  },
  true
);

const hackSafe = async () => {
  const safeState = await RPC.execute<Safe.State>('storerobbery:server:getSafeState', locationManager.currentStore);
  if (safeState !== 'closed') {
    Notifications.add('Je moet dit niet meer ontcijferen.', 'error');
    return;
  }

  const hasItem = await Inventory.doesPlayerHaveItems('decoding_tool');
  if (!hasItem) {
    Notifications.add('Hoe ga je dit openen?', 'error');
    return;
  }

  Events.emitNet('storerobbery:server:startJob', locationManager.currentStore, 'safe')
  const gameSuccess = await Minigames.sequencegame(4, 5, 10);
  const removedItem = await Inventory.removeItemFromPlayer('decoding_tool');
  if (!removedItem) return;

  if (gameSuccess) {
    Events.emitNet('storerobbery:server:hackSafe', locationManager.currentStore);
    global.exports['dg-phone'].sendMail(
      'Decodering Kluis',
      'Hackerman',
      'Het decoderen van de kluis zal even duren. <br><br>Geef me 5 minuten. <br><br>Ga niet uit de winkel of de verbinding zal verbreken!'
    );
  } else {
    Notifications.add('Mislukt...', 'error');
  }
};

const lootSafe = async () => {
  const safeState = await RPC.execute<Safe.State>('storerobbery:server:getSafeState', locationManager.currentStore);
  if (safeState !== 'opened') {
    Notifications.add('Dit is nog niet open.', 'error');
    return;
  }

  Events.emitNet('storerobbery:server:lootSafe', locationManager.currentStore);
  const ped = PlayerPedId();
  await Util.loadAnimDict('amb@prop_human_bum_bin@idle_b');
  TaskPlayAnim(ped, 'amb@prop_human_bum_bin@idle_b', 'idle_d', 8.0, 8.0, -1, 50, 0, false, false, false);
  await Util.Delay(700);
  TaskPlayAnim(ped, 'amb@prop_human_bum_bin@idle_b', 'exit', 8.0, 8.0, -1, 50, 0, false, false, false);
};
