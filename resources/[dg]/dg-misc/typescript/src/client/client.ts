import './modules/crouch';
import './modules/taskbar';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './modules/elevators';
import './modules/propattach';
import './modules/rental/controller.rental';
import './modules/gtabehaviour';
import './services/laptop';
import './services/config';
import './services/boatanchor';
import './services/minimap';
import './services/idmenu';
import './services/me';
import './services/editor';
import './services/point';
import './services/tackle';
import './services/consumables';
import './services/yoga';
import './services/seats';

import { setDiscordRichPresence } from 'modules/discord/service.discord';
import { setGTABehaviour } from 'modules/gtabehaviour/service.gtabehaviour';

setImmediate(() => {
  setDiscordRichPresence();
  setGTABehaviour();
});
