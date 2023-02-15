import { Auth } from '@dgx/server';
import { sendWeedPlantModelsToClient } from 'modules/weed/service.weed';

Auth.onAuth(plyId => {
  sendWeedPlantModelsToClient(plyId);
});
