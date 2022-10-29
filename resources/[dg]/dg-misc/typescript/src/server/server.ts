import { startParticleThread } from 'modules/particles/service.particles';

import './modules/blackmoney';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './modules/elevators/controller.elevators';
import './services/laptop';
import './services/config';
import './controllers';

setImmediate(() => {
  startParticleThread();
});
