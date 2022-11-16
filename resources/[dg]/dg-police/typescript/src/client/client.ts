import { RPC } from '@dgx/client';
import { buildSpeedZones } from 'modules/speedzones/service.speedzones';
import { loadLockers } from './services/lockers';
import { buildLabPeekZone } from 'modules/evidence/service.evidence';
import { buildSafeZones } from 'services/safe';
import { loadPrisonConfig } from 'modules/prison/service.prison';

import './controllers';
import './services/plateflags';
import './services/lockers';
import './services/logout';
import './services/safe';
import './modules/trackers';
import './modules/radar';
import './modules/speedzones';
import './modules/spikestrips';
import './modules/badges';
import './modules/evidence';
import './modules/binoculars';
import './modules/interactions';
import './modules/prison';
import './modules/heli';

setImmediate(async () => {
  const config = await RPC.execute<Police.Config>('police:getConfig');
  if (!config) return;

  buildSpeedZones(config.speedzones);
  loadLockers(config.config.lockers);
  buildLabPeekZone(config.config.labLocation);
  buildSafeZones(config.config.safes);
  loadPrisonConfig(config.prison);
});
