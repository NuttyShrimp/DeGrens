import { Events } from '@dgx/client';
import { cleanupSanddigging, loadSanddiggingConfig } from 'modules/sanddigging/service.sanddigging';
import { buildFishingReturnZone, cleanupFishingJob } from 'modules/fishing/service.fishing';
import { buildScrapyardReturnZone, cleanupScrapyard } from 'modules/scrapyard/service.scrapyard';
import { cleanupSanitationJob } from 'modules/sanitation/servive.sanitation';
import { cleanupPostOPJob, registerPostOPStartPeekOptions } from 'modules/postop/service.postop';

on('jobs:client:openJobAllowlist', () => {
  Events.emitNet('jobs:whitelist:server:openJobAllowlist');
});

onNet('DGCore:client:playerUnloaded', () => {
  cleanupSanddigging();
  cleanupFishingJob();
  cleanupScrapyard();
  cleanupSanitationJob();
  cleanupPostOPJob();
});

Events.onNet(
  'jobs:modules:init',
  (initData: {
    sanddigging: Sanddigging.Config;
    fishingReturnZone: Fishing.Config['vehicle'];
    scrapyardReturnZone: Scrapyard.Config['returnZone'];
    postopTypes: PostOP.Config['types'];
  }) => {
    loadSanddiggingConfig(initData.sanddigging);
    buildFishingReturnZone(initData.fishingReturnZone);
    buildScrapyardReturnZone(initData.scrapyardReturnZone);
    registerPostOPStartPeekOptions(initData.postopTypes);
  }
);
