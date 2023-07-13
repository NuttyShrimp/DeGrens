import { Auth } from '@dgx/server/classes';
import { awaitNpcConfigLoad } from 'services/config';
import { dispatchAllNpcsToClient } from 'services/npcs';

Auth.onAuth(async plyId => {
  await awaitNpcConfigLoad();
  dispatchAllNpcsToClient(plyId);
});
