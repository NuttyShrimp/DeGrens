import './modules/houses';
import './services/mailbox';
import './controllers/ui';
import { loadHouses } from 'modules/houses/services/store';

setImmediate(() => {
  if (LocalPlayer.state.isLoggedIn) {
    loadHouses();
  }
});
