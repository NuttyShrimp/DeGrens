import { Events } from '@dgx/client';
import { enableBinoculars } from './service.binoculars';

Events.onNet('police:binoculars:use', (type: 'binoculars' | 'pd_camera') => {
  enableBinoculars(type);
});
