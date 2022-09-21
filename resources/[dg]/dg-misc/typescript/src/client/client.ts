import './modules/crouch';
import './modules/taskbar';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './services/laptop';

import { startCrouchThread } from 'modules/crouch/service.crouch';
import { setDiscordRichPresence } from 'modules/discord/service.discord';

setImmediate(() => {
  startCrouchThread();
  setDiscordRichPresence();
});
