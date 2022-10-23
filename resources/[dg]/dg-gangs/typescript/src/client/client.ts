import './controllers';
import './services/cache';
import { fetchCurrentGang } from './services/cache';

setImmediate(() => {
  if (!LocalPlayer.state.isLoggedIn) return;
  fetchCurrentGang();
});
