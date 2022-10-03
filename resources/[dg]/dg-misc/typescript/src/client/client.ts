import './modules/crouch';
import './modules/taskbar';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './services/laptop';
import './services/config';

import { startCrouchThread } from 'modules/crouch/service.crouch';
import { setDiscordRichPresence } from 'modules/discord/service.discord';
import { setGTABehaviour } from 'modules/gtabehaviour/service.gtabehaviour';

setImmediate(() => {
  startCrouchThread();
  setDiscordRichPresence();

  setGTABehaviour();
});
