import { loadPoliceConfig } from 'services/config';
import { loadAllFlaggedPlates } from './services/plateflags';

import './controllers';
import './services/plateflags';
import './modules/trackers';
import './modules/spikestrips';
import './modules/badges';
import './modules/evidence';
import './modules/alerts';
import './modules/interactions';
import './modules/prison';

setImmediate(async () => {
  await loadPoliceConfig();

  loadAllFlaggedPlates();
});
