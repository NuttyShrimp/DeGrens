import { Config, Events } from '@dgx/server';

let cams: Dispatch.Cams.Cam[] = [];

export const loadCams = async () => {
  await Config.awaitConfigLoad();
  cams = Config.getConfigValue('dispatch.cams');
  Events.emitNet('dispatch:cams:load', -1, cams);
};

export const getCams = () => cams;
