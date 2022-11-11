import './modules/crouch';
import './modules/taskbar';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './modules/elevators';
import './services/laptop';
import './services/config';
import './services/boatanchor';

import { setDiscordRichPresence } from 'modules/discord/service.discord';
import { setGTABehaviour } from 'modules/gtabehaviour/service.gtabehaviour';

setImmediate(() => {
  setDiscordRichPresence();
  setGTABehaviour();
});
