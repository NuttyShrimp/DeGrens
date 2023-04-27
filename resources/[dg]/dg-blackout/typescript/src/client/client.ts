import blackoutManager from 'classes/BlackoutManager';

import './controllers';

setImmediate(() => {
  blackoutManager.loadStateBag(
    GlobalState.blackoutState ?? {
      blackout: false,
      safezones: false,
    }
  );
});
