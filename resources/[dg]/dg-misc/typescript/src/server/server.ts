import { startParticleThread } from 'modules/particles/service.particles';
import { loadStatusData } from 'modules/status/service.status';

import './modules/blackmoney';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './modules/elevators/controller.elevators';
import './modules/status';
import './services/laptop';
import './services/config';
import './controllers';

setImmediate(() => {
  startParticleThread();
  loadStatusData();
});
