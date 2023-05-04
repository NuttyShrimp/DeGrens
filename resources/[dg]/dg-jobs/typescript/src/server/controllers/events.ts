import { Admin, Auth, Events, RPC, Jobs, Config, Util, Core } from '@dgx/server';
import { handlePlayerLeftFishingGroup, syncFishingJobToClient } from 'modules/fishing/service.fishing';
import { handlePlayerLeftSanitationGroup, syncSanitationJobToClient } from 'modules/sanitation/service.sanitation';
import { handlePlayerLeftScrapyardGroup, syncScrapyardJobToClient } from 'modules/scrapyard/service.scrapyard';
import { handlePlayerLeftPostOPGroup, syncPostOPJobToClient } from 'modules/postop/service.postop';
import whitelistManager from 'classes/whitelistmanager';
import signedInManager from 'classes/signedinmanager';
import { handlePlayerLeftSanddiggingGroup, syncSanddiggingJobToClient } from 'modules/sanddigging/service.sanddigging';
import { finishHuntingJobForPlayer } from 'modules/hunting/service.hunting';
import { seedPlyGroupUIStore } from 'modules/groups/service';

Auth.onAuth(async src => {
  whitelistManager.seedPlyUIStore(src);
  Events.emitNet('jobs:client:updateAmountCache', src, signedInManager.getAmountsForEachJob());
  signedInManager.dispatchSignInLocations(src);
  seedPlyGroupUIStore(src);

  // Init jobs
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue('jobs') as {
    sanddigging: Sanddigging.Config;
    fishing: Fishing.Config;
    scrapyard: Scrapyard.Config;
    postop: PostOP.Config;
    hunting: Hunting.Config;
  };

  Events.emitNet('jobs:modules:init', src, {
    sanddigging: config.sanddigging,
    fishingReturnZone: config.fishing.vehicle,
    scrapyardReturnZone: config.scrapyard.returnZone,
    scrapyardPartItems: config.scrapyard.partItems,
    postopTypes: config.postop.types,
    huntingAnimals: config.hunting.animals,
  });
});

// Admin menu jobs selector seeding
RPC.register('jobs:whitelist:getInfoList', (src: number) => {
  if (!Admin.hasPermission(src, 'support')) return [];
  const jobs: { name: string; ranks: number }[] = [];
  whitelistManager.config.forEach((info, name) => jobs.push({ name, ranks: info.grades.length }));
  return jobs;
});

// Dispatch amounts to every player when anyones job updates
Jobs.onJobUpdate(() => {
  Events.emitNet('jobs:client:updateAmountCache', -1, signedInManager.getAmountsForEachJob());
});

// #region Jobs
Core.onPlayerLoaded(playerData => {
  const group = Jobs.getGroupByCid(playerData.citizenid);
  if (group) {
    // wait a few sec to ensure everything has properly loaded for the player like phone, inventory etc
    setTimeout(() => {
      if (!playerData.serverId) return;
      syncFishingJobToClient(group.id, playerData.serverId);
      syncScrapyardJobToClient(group.id, playerData.serverId);
      syncSanitationJobToClient(group.id, playerData.serverId);
      syncPostOPJobToClient(group.id, playerData.serverId);
      syncSanddiggingJobToClient(group.id, playerData.serverId);
    }, 5000);
  }
});

Jobs.onGroupJoin((plyId, _, groupId) => {
  syncFishingJobToClient(groupId, plyId);
  syncPostOPJobToClient(groupId, plyId);
  syncSanddiggingJobToClient(groupId, plyId);
  syncSanitationJobToClient(groupId, plyId);
  syncScrapyardJobToClient(groupId, plyId);
});

Jobs.onGroupLeave((plyId, _, groupId) => {
  handlePlayerLeftFishingGroup(groupId, plyId);
  handlePlayerLeftPostOPGroup(groupId, plyId);
  handlePlayerLeftSanddiggingGroup(groupId, plyId);
  handlePlayerLeftSanitationGroup(groupId, plyId);
  handlePlayerLeftScrapyardGroup(groupId, plyId);
  finishHuntingJobForPlayer(plyId);
});

Core.onPlayerUnloaded(plyId => {
  finishHuntingJobForPlayer(plyId);
});
