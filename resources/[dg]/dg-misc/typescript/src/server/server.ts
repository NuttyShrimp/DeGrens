import { startParticleThread } from 'modules/particles/service.particles';
import { loadStatusData } from 'modules/status/service.status';
import { loadAllPlayerReputations } from 'modules/reputation/service.reputation';
import { loadHudConfig } from 'modules/hud/service.hud';

import './modules/particles';
import './modules/hud';
import './modules/radio/controller.radio';
import './modules/elevators/controller.elevators';
import './modules/status';
import './modules/reputation';
import './modules/rental/controller.rental';
import './modules/objectManager/controller.objectmanager';
import './modules/arena';
import './modules/propremover';
import './services/laptop';
import './services/config';
import './services/boatanchor';
import './services/editor';
import './services/consumables';
import './services/tackle';
import './services/seats';
import './services/idlist';
import './services/walkstyles';
import './services/convars';
import './services/useables';
import './services/news';
import './controllers';

setImmediate(() => {
  startParticleThread();
  loadStatusData();
  loadAllPlayerReputations();
  loadHudConfig();
});
