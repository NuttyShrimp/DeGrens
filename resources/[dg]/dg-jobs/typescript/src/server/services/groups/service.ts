import { Notifications, Util } from '@dgx/server';

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

export const getGroupById = (groupId: string): Groups.Group | undefined => {
  const group = groupManager.getGroupById(groupId);
  if (!group) return undefined;
  return group.getInfo();
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

export const leaveGroup = (src: number): boolean => {
  groupLogger.silly(`[groups:leave] ${Util.getName(src)} has been removed from group`);
  const cid = Util.getCID(src);
  const group = groupManager.getGroupByCID(cid);
  if (!group) {
    groupLogger.warn(`${Util.getName(src)} tried to leave a group while not being in a group`);
    return true;
  }
  group.removeMember(cid);
  if (group.getMemberByCID(cid)) {
    groupLogger.error(`${Util.getName(src)} left a group but is still in it`);
    return false;
  }
  return true;
};

// By removing owner, group gets disbanded.
// If we would directly call groupManager.disbandGroup, we would get in a loop after removing owner within disband and calling disband again
export const disbandGroup = (groupId: string) => {
  groupLogger.silly(`[groups:disband] Disbanding group ${groupId}`);
  const group = groupManager.getGroupById(groupId);
  if (!group) {
    groupLogger.warn(`Tried to disband group but group did not exist`);
    return;
  }
  const ownerCid = group.owner;
  group.removeMember(ownerCid);
};
