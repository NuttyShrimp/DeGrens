import { Events } from '@dgx/client';
import { cleanupSanddigging } from 'modules/sanddigging/service.sanddigging';
import { cleanupFishingJob } from 'modules/fishing/service.fishing';
import { cleanupScrapyard } from 'modules/scrapyard/service.scrapyard';
import { cleanupSanitationJob } from 'modules/sanitation/servive.sanitation';
import { cleanupPostOPJob } from 'modules/postop/service.postop';

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
