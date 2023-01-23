import { Auth } from '@dgx/server';
import lockersManager from 'classes/LockersManager';

Auth.onAuth(plyId => {
  lockersManager.distributeLockersToPlayer(plyId);
});
