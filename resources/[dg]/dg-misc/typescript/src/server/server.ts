import { startParticleThread } from 'modules/particles/service.particles';

import './modules/blackmoney';
import './modules/particles';
import './modules/hud';

setImmediate(() => {
  startParticleThread();
});
