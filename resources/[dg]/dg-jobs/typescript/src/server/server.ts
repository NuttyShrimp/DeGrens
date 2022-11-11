import { Config } from '@dgx/server';

import { loadLocations } from 'services/signin';
import nameManager from 'modules/groups/classes/NameManager';
import { initializeSanddigging } from 'modules/sanddigging/service.sanddigging';
import { initializeFishing } from 'modules/fishing/service.fishing';
import { initializeScrapyard } from 'modules/scrapyard/service.scrapyard';
import { initializeSanitation } from 'modules/sanitation/service.sanitation';

import './controllers';
import './modules';

setImmediate(() => {
  loadLocations();
  nameManager.generateAllPlayerNames();

  // Initialize all job modules
  initializeJobs();
});

const initializeJobs = async () => {
  await Config.awaitConfigLoad();
  initializeSanddigging();
  initializeFishing();
  initializeScrapyard();
  initializeSanitation();
};
