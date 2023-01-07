import { Auth, Events } from '@dgx/server';
import { awaitHospitalConfigLoad, getHospitalConfig } from 'services/config';

Auth.onAuth(async plyId => {
  await awaitHospitalConfigLoad();
  const config = getHospitalConfig();
  Events.emitNet('hospital:client:init', plyId, config);
});
