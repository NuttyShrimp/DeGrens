import { Admin, Auth, Events, RPC, Util, Jobs, Config } from '@dgx/server';
import { syncFishingJobToClient } from 'modules/fishing/service.fishing';
import { syncSanitationJobToClient } from 'modules/sanitation/service.sanitation';
import { syncScrapyardJobToClient } from 'modules/scrapyard/service.scrapyard';
import {
  getAmountsForEachJob,
  getLocations,
  getPlayerJob,
  openSignInMenu,
  playerLoaded,
  playerUnloaded,
  signIn,
  signOut,
} from '../services/signin';
import {
  assignRank,
  getPlayerInfoForJob,
  hasSpeciality,
  openAllowListMenu,
  toggleSpecialty,
  whitelistLogger,
  config,
  getWhitelistedJobsForPlayer,
  addWhitelist,
  removeWhitelist,
} from '../services/whitelist';
import { syncPostOPJobToClient } from 'modules/postop/service.postop';

global.exports('signPlayerOutOfAnyJob', (plyId: number) => {
  const job = getPlayerJob(plyId);
  if (!job) return;
  signOut(plyId, job);
});

Auth.onAuth(src => {
  const whitelistedJobs = getWhitelistedJobsForPlayer(src);
  Events.emitNet('jobs:client:whitelistedJobs', src, whitelistedJobs);
  Events.emitNet('jobs:client:updateAmountCache', src, getAmountsForEachJob());
});

on('jobs:server:signin:update', () => {
  Events.emitNet('jobs:client:updateAmountCache', -1, getAmountsForEachJob());
});

Events.onNet('jobs:server:signIn:openDutyBoard', (src, locId: number) => {
  if ((locId ?? -1) < 0) return;
  openSignInMenu(src, locId);
});

Events.onNet('jobs:server:signIn', (src, job: string) => {
  signIn(src, job);
});

Events.onNet('jobs:server:signOut', (src, job: string) => {
  signOut(src, job);
});

on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  playerLoaded(playerData.source, playerData.citizenid);
});

on('DGCore:server:playerUnloaded', (plyId: number, cid: number) => {
  playerUnloaded(plyId, cid);
});

Events.onNet('jobs:whitelist:server:openJobAllowlist', (src, filter?: string) => {
  openAllowListMenu(src, filter);
});

Events.onNet('jobs:whitelist:server:assignRank', (src: number, cid: number, rank: number) => {
  if (!hasSpeciality(src, 'HC')) {
    Util.Log(
      'jobs:whitelist:assignRank:failed',
      {
        cid,
        rank,
      },
      `${src} does not have HC speciality`,
      src
    );
    whitelistLogger.info(
      `${GetPlayerName(
        String(src)
      )} tried to assign rank ${rank} to ${cid} but failed because they do not have HC speciality`
    );
    return;
  }
  assignRank(src, cid, rank);
});

Events.onNet(
  'jobs:whitelist:toggleSpecialty',
  (src: number, cid: number, specialty: string, type: 'add' | 'remove') => {
    if (!hasSpeciality(src, 'HC')) {
      Util.Log(
        'jobs:whitelist:assignSpecialty:failed',
        {
          cid,
          specialty,
          type,
        },
        `${src} does not have HC speciality`,
        src
      );
      whitelistLogger.info(
        `${GetPlayerName(
          String(src)
        )} tried to ${type} ${specialty} to ${cid} but failed because they do not have HC speciality`
      );
      return;
    }
    toggleSpecialty(src, cid, specialty, type);
  }
);

Events.onNet('jobs:whitelist:hire', (src, job: string, target: number) => {
  addWhitelist(src, job, 0, target);
});

Events.onNet('jobs:whitelist:fire', (src, job: string, target: number) => {
  removeWhitelist(src, job, target);
});

RPC.register('jobs:server:getSignInLocations', () => {
  return getLocations();
});

RPC.register('jobs:whitelist:hasWhitelistAccess', src => {
  return hasSpeciality(src, 'HC');
});

RPC.register('jobs:server:getCurrentJob', src => {
  return getPlayerJob(src);
});

RPC.register('jobs:server:hasSpeciality', (src: number, speciality: string) => {
  return hasSpeciality(src, speciality);
});

RPC.register('jobs:whitelist:isWhitelisted', (src: number, job: string) => {
  const cid = Util.getCID(src);
  if (!cid) return false;
  return !!getPlayerInfoForJob(cid, job);
});

// Admin menu jobs selector seeding
RPC.register('jobs:whitelist:getInfoList', (src: number) => {
  if (!Admin.hasPermission(src, 'staff')) return [];
  const jobs: { name: string; ranks: number }[] = [];
  config.forEach((info, name) => jobs.push({ name, ranks: info.grades.length }));
  return jobs;
});

// #region Jobs
on('DGCore:server:playerLoaded', (playerData: PlayerData) => {
  const group = Jobs.getGroupByCid(playerData.citizenid);
  if (!group) return;

  // wait a few sec to ensure everything has properly loaded for the player like phone, inventory etc
  setTimeout(() => {
    syncFishingJobToClient(group.id, playerData.source);
    syncScrapyardJobToClient(group.id, playerData.source, playerData.citizenid);
    syncSanitationJobToClient(group.id, playerData.source);
    syncPostOPJobToClient(group.id, playerData.source);
  }, 5000);
});

RPC.register('jobs:modules:getInitData', async () => {
  await Config.awaitConfigLoad();
  const config = Config.getConfigValue('jobs') as {
    sanddigging: Sanddigging.Config;
    fishing: Fishing.Config;
    scrapyard: Scrapyard.Config;
    postop: PostOP.Config;
  };
  return {
    sanddigging: config.sanddigging,
    fishingReturnZone: config.fishing.vehicle,
    scrapyardReturnZone: config.scrapyard.returnZone,
    postopTypes: config.postop.types,
  };
});
// #endregion
