import { Config } from '@dgx/server';
import whitelistManager from 'classes/whitelistmanager';
import signedInManager from 'classes/signedinmanager';
import nameManager from 'modules/groups/classes/NameManager';

import { initializeSanddigging } from 'modules/sanddigging/service.sanddigging';
import { initializeFishing } from 'modules/fishing/service.fishing';
import { initializeScrapyard } from 'modules/scrapyard/service.scrapyard';
import { initializeSanitation } from 'modules/sanitation/service.sanitation';
import { initializePostop } from 'modules/postop/service.postop';
import { initializeHunting } from 'modules/hunting/service.hunting';

import './controllers';
import './modules';

setImmediate(async () => {
  await Config.awaitConfigLoad();

  signedInManager.loadLocations();
  whitelistManager.loadWhitelistConfig();
  whitelistManager.loadWhitelistJobs();
  nameManager.generateAllPlayerNames();

  // Initialize all job modules
  initializeSanddigging();
  initializeFishing();
  initializeScrapyard();
  initializeSanitation();
  initializePostop();
  initializeHunting();
});
