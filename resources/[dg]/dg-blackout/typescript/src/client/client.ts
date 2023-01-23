import blackoutManager from 'classes/BlackoutManager';
import './controllers';

setImmediate(() => {
  blackoutManager.loadState();
});
