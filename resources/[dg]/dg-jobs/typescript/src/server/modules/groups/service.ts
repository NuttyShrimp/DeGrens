import { Notifications } from '@dgx/server';

import groupManager from './classes/GroupManager';
import { groupLogger } from './logger';

/**
 * Creates an array with the stripped data for the client
 * Should contain only the bare minimum data is should need
 */
export const getGroupList = (): JobGroup[] => {
  const groups = groupManager.getGroups();
  return groups.map(g => g.getClientInfo());
};

export const getGroupByCid = (cid: number): Groups.Group | undefined => {
  const group = groupManager.getGroupByCID(cid);
  if (!group) return undefined;
  return group.getInfo();
};

export const getGroupByServerId = (id: number): Groups.Group | undefined => {
  const group = groupManager.getGroupByServerId(id);
  if (!group) return undefined;
  return group.getInfo();
};

export const changeJob = (src: number, job: string) => {
  // Src should be the owner
  const group = groupManager.getGroupByServerId(src);
  if (!group) {
    Notifications.add(src, 'Je moet in een groep zitten om deze job te kunnen kiezen.');
    return false;
  }
  if (group.isBusy()) {
    Notifications.add(src, 'Je groep is al bezig met een job, Werk deze eerst af voordat je een nieuwe job kiest!');
    return false;
  }
  return group.setActiveJob(job);
};

export const createGroup = (src: number): boolean => {
  groupLogger.silly(`[groups:create] ${GetPlayerName(String(src))}(${src}) is trying to create a group`);
  groupManager.createGroup(src);
  // Check if the user is actually in a group
  const group = groupManager.getGroupByServerId(src);
  return group !== undefined;
};
