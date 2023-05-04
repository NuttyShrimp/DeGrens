import { Core, Events, Util } from '@dgx/client';
import { cleanupSanddigging, loadSanddiggingConfig } from 'modules/sanddigging/service.sanddigging';
import { buildFishingReturnZone, cleanupFishingJob } from 'modules/fishing/service.fishing';
import {
  buildScrapyardReturnZone,
  cleanupScrapyard,
  registerScrapyardStartPeekOptions,
} from 'modules/scrapyard/service.scrapyard';
import { cleanupSanitationJob } from 'modules/sanitation/servive.sanitation';
import { cleanupPostOPJob, registerPostOPStartPeekOptions } from 'modules/postop/service.postop';
import { cleanupHuntingJob, registerHuntingAnimalPeekEntries } from 'modules/hunting/service.hunting';

Core.onPlayerUnloaded(() => {
  cleanupSanddigging();
  cleanupFishingJob();
  cleanupScrapyard();
  cleanupSanitationJob();
  cleanupPostOPJob();
  cleanupHuntingJob();
});

Events.onNet(
  'jobs:modules:init',
  (initData: {
    sanddigging: Sanddigging.Config;
    fishingReturnZone: Fishing.Config['vehicle'];
    scrapyardReturnZone: Scrapyard.Config['returnZone'];
    scrapyardPartItems: Scrapyard.Config['partItems'];
    postopTypes: PostOP.Config['types'];
    huntingAnimals: Hunting.Config['animals'];
  }) => {
    loadSanddiggingConfig(initData.sanddigging);
    buildFishingReturnZone(initData.fishingReturnZone);
    buildScrapyardReturnZone(initData.scrapyardReturnZone);
    registerScrapyardStartPeekOptions(initData.scrapyardPartItems);
    registerPostOPStartPeekOptions(initData.postopTypes);
    registerHuntingAnimalPeekEntries(initData.huntingAnimals);
  }
);
