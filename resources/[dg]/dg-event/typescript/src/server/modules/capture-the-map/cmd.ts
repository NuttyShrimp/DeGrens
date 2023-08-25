import { Chat, Events, Gangs, Overwrites } from '@dgx/server';
import { isAnyEventRunning, toggleEvent } from 'helpers/state';
import { getZoneOwners, initZones } from './services/zones';
import { initRestockZones } from './services/restock';
import { ctmLogger } from './logger';
import { gang_blip_color_names } from '@shared/data/blips';
import { startGuardThread } from './services/guards';

RegisterCommand(
  'event:ctm:start',
  async () => {
    if (isAnyEventRunning()) {
      ctmLogger.warn('There is already an event running');
      return;
    }
    toggleEvent('ctm');
    ctmLogger.info('Started Capture the Map event');

    Chat.sendMessage(-1, {
      message:
        'Er is een grote bedreiging op ons eiland! Help onze stad te verdedigen. Op je google maps kan je de leger barricades zien! Ga hierheen voor meer info!',
      prefix: 'Staatsmelding: ',
      type: 'error',
    });

    for (const gang in gang_blip_color_names) {
      Gangs.addFeedMessage({
        title: 'Grote rivaliteit op komst!',
        content: `Er is een nieuwe Italiaanse mafia op komst. Verdedig je stad! Maar laat zeker de kans niet liggen om zelf de macht te nemen ;), jouw gang kleur is: ${gang_blip_color_names[gang]}`,
        gang,
      });
    }

    await initZones();
    await initRestockZones();
    startGuardThread();
    Overwrites.setOverwrite('vehicleClass', 'D');
    Overwrites.setOverwrite('police:blockActivities', true);
    Overwrites.setOverwrite('queue:slotsAvailabls', true);
    Overwrites.setOverwrite('hospital:keepItems', true);
    Events.emitNet('event:ctm:init', -1, getZoneOwners());
  },
  true
);
