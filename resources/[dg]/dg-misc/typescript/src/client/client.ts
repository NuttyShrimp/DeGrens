import './controllers';
import './modules/crouch';
import './modules/taskbar';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './modules/elevators';
import './modules/propattach';
import './modules/rental/controller.rental';
import './modules/gtabehaviour';
import './modules/animloops';
import './modules/objectManager/controller.objectmanager';
import './modules/arena';
import './modules/blipmanager';
import './modules/fpcam';
import './modules/propremover';
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
import './services/walkstyles';
import './services/spacespam';
import './services/parachute';
import './services/scubagear';
import './services/grid';
import './services/useables';
import './services/news';

import { setDiscordRichPresence } from 'modules/discord/service.discord';
import { setGTABehaviour } from 'modules/gtabehaviour/service.gtabehaviour';
import { startLadderThread } from 'services/ladders';
import { startPlayerBlipCoordSaveThread } from 'modules/blipmanager/service.blipmanager';
import { schedulePropRemoval } from 'modules/propremover/service.propremover';

setImmediate(() => {
  setDiscordRichPresence();
  setGTABehaviour();
  startLadderThread();
  startPlayerBlipCoordSaveThread();
  schedulePropRemoval();
});
