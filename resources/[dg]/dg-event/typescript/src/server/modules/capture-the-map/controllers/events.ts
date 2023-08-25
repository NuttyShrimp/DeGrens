import { Auth, Chat, Events, Hospital, Inventory, Notifications, Util } from '@dgx/server';
import { getRunningEvent } from 'helpers/state';

import { ctmLogger } from '../logger';
import { openRestockMenu, restockWeapon } from '../services/restock';
import { getZoneOwners, leaveZone, resetZoneState, setZoneOwner, startZoneCapture } from '../services/zones';

Auth.onAuth(src => {
  if (getRunningEvent() === 'ctm') {
    Events.emitNet('event:ctm:init', src, getZoneOwners());
    Chat.sendMessage(src, {
      message:
        'Er is een grote bedreiging op ons eiland! Help onze stad te verdedigen. Op je google maps kan je de leger barricades zien! Ga hierheen voor meer info!',
      prefix: 'Staatsmelding: ',
      type: 'error',
    });
  }
});

Events.onNet('events:ctm:capture_zone', (src: number, zoneName: string) => {
  startZoneCapture(zoneName, src);
});

Events.onNet('events:ctm:leave_zone', (src: number, zoneName: string) => {
  leaveZone(zoneName, src);
});

Events.onNet('event:ctm:restockMenu', (src: number) => {
  openRestockMenu(src);
});

Events.onNet('event:ctm:restockWeapon', (src: number, weapon: string, type: string) => {
  restockWeapon(src, weapon, type);
});

Inventory.registerUseable('morphine_syringe', async (src, item) => {
  const success = await Inventory.removeItemByIdFromPlayer(src, item.id);
  if (!success) return;
  const nearestPly = Util.getClosestPlayer(src, 5);
  if (!nearestPly || !Hospital.isDown(nearestPly)) {
    Notifications.add(src, 'Er is niemand in de buurt die morphine nodig heeft!', 'error');
    return;
  }
  Notifications.add(nearestPly, 'Je hebt een morphine boost gekregen!');
  Hospital.revivePlayer(nearestPly);
});

RegisterCommand(
  'event:ctm:setZoneOwner',
  (src: number, _: string, argStr: string) => {
    if (src > 0) {
      ctmLogger.warn(`Person ${Util.getName(src)}${src} heeft geprobeerd een zone handmatig te veranderen: ${argStr}`);
      return;
    }
    const args = argStr.split(' ');
    setZoneOwner(args[0], args[1]);
  },
  true
);

RegisterCommand(
  'event:ctm:resetZoneState',
  (src: number, _: string, argStr: string) => {
    if (src > 0) {
      ctmLogger.warn(`Person ${Util.getName(src)}${src} heeft geprobeerd een zone handmatig te veranderen: ${argStr}`);
      return;
    }
    const args = argStr.split(' ');
    resetZoneState(args[1]);
  },
  true
);
