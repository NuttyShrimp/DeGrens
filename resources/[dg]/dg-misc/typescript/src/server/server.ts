import { startParticleThread } from 'modules/particles/service.particles';
import { loadStatusData } from 'modules/status/service.status';
import { loadAllPlayerReputations } from 'modules/reputation/service.reputation';

import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './modules/elevators/controller.elevators';
import './modules/status';
import './modules/reputation';
import './modules/propattach';
import './services/laptop';
import './services/config';
import './services/boatanchor';
import './services/editor';
import './controllers';

setImmediate(() => {
  startParticleThread();
  loadStatusData();
  loadAllPlayerReputations();
});
