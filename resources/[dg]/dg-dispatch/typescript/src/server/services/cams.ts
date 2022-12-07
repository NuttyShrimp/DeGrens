import { Events } from '@dgx/server';

let cams: Dispatch.Cams.Cam[] = [];

export const loadCams = (config: Dispatch.Cams.Cam[]) => {
  cams = config;
  Events.emitNet('dispatch:cams:load', -1, cams);
};

export const getCams = () => cams;
