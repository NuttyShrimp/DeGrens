import './modules/blackmoney';
import './modules/particles';

import { startParticleThread } from 'modules/particles/service.particles';

setImmediate(() => {
  startParticleThread();
});
