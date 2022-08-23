import { Admin, Events, RPC, Util } from '@dgx/server';
import { getLocations, getPlayerJob, openSignInMenu, signIn, signOut } from '../services/signin';
import {
  assignRank,
  getPlayerInfoForJob,
  hasSpeciality,
  openAllowListMenu,
  toggleSpecialty,
  whitelistLogger,
  config
} from '../services/whitelist';

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

Events.onNet('jobs:whitelist:server:openJobAllowlist', (src, filter?: string) => {
  if (!hasSpeciality(src, 'HC')) return;
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

RPC.register('jobs:whitelist:getInfoList', (src: number) => {
  if (!Admin.hasPermission(src, 'staff')) return [];
  const jobs: { name: string; ranks: number }[] = [];
  config.forEach((info, name) => jobs.push({ name, ranks: info.grades.length }))
  return jobs;
})
