import './modules/crouch';
import './modules/taskbar';

import { startCrouchThread } from 'modules/crouch/service.crouch';
import { setDiscordRichPresence } from 'modules/discord/service.discord';

setImmediate(() => {
  startCrouchThread();
  setDiscordRichPresence();
});
