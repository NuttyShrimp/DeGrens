import { startNeedsThread } from 'modules/needs/service.needs';

import './controller';
import './modules/down';
import './modules/job';
import './modules/health';
import './modules/beds';
import './services/ang';

setImmediate(() => {
  // Start needs thread only when ply is logged in
  if (LocalPlayer.state.isLoggedIn) {
    startNeedsThread();
  }
});
