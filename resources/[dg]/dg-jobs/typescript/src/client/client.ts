import { RPC } from '@dgx/client';
import { loadSanddiggingConfig } from 'modules/sanddigging/service.sanddigging';
import { buildScrapyardReturnZone } from 'modules/scrapyard/service.scrapyard';
import { buildFishingReturnZone } from 'modules/fishing/service.fishing';
import { registerPostOPStartPeekOptions } from 'modules/postop/service.postop';

import './services/signin';
import './services/amountcache';
import './controllers';
import './modules';

setImmediate(() => {
  emitNet('dg-jobs:client:groups:loadStore');
  initializeJobs();
});

const initializeJobs = async () => {
  const initData = await RPC.execute<{
    sanddigging: Sanddigging.Config;
    fishingReturnZone: Fishing.Config['vehicle'];
    scrapyardReturnZone: Scrapyard.Config['returnZone'];
    postopTypes: PostOP.Config['types'];
  }>('jobs:modules:getInitData');
  if (!initData) return;

  loadSanddiggingConfig(initData.sanddigging);
  buildFishingReturnZone(initData.fishingReturnZone);
  buildScrapyardReturnZone(initData.scrapyardReturnZone);
  registerPostOPStartPeekOptions(initData.postopTypes);
};
