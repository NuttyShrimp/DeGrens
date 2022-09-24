import { startParticleThread } from 'modules/particles/service.particles';

import './modules/blackmoney';
import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './services/laptop';
import './controllers';

setImmediate(() => {
  startParticleThread();
});
