import { startNeedsThread } from 'modules/needs/service.needs';
import { registerHealItems } from 'modules/health/controller.health';
import { loadHospitalConfig } from 'services/config';
import { loadOnDamageStatusses } from 'modules/health/service.health';

import './controllers';
import './modules/down';
import './modules/needs';
import './modules/health';
import './modules/job';
import './modules/beds';
import './services/armor';

setImmediate(async () => {
  await loadHospitalConfig();

  startNeedsThread();
  registerHealItems();
  loadOnDamageStatusses();
});
