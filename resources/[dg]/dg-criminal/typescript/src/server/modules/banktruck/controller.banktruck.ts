import { Core } from '@dgx/server';
import banktruckManager from './manager.banktruck';

Core.onPlayerUnloaded(plyId => {
  banktruckManager.handlePlayerLeft(plyId);
});
