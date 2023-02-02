import { loadPoliceConfig } from 'services/config';
import { loadAllFlaggedPlates } from './services/plateflags';
import { restoreAllPlayerSentences } from 'modules/prison/service.prison';

import './controllers';
import './services/plateflags';
import './services/requirements';
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
  restoreAllPlayerSentences();
});
