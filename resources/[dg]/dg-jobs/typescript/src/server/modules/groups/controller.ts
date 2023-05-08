import { Core, Inventory, RPC, Util } from '@dgx/server';
import groupManager from './classes/GroupManager';
import nameManager from './classes/NameManager';
import { groupLogger } from './logger';
import {
  changeJob,
  changeJobOfPlayerGroup,
  createGroup,
  disbandGroup,
  getGroupByCid,
  getGroupById,
  getGroupByServerId,
  getGroupList,
  leaveGroup,
  seedPlyGroupUIStore,
} from './service';
import { charModule } from 'helpers/core';

global.exports('createGroup', createGroup);
global.exports('getGroupById', getGroupById);
global.exports('getGroupByCid', getGroupByCid);
global.exports('getGroupByServerId', getGroupByServerId);
global.exports('changeJob', changeJob);
global.exports('changeJobOfPlayerGroup', changeJobOfPlayerGroup);
global.exports('leaveGroup', leaveGroup);
global.exports('disbandGroup', disbandGroup);

onNet('dg-jobs:client:groups:seedStore', () => {
  seedPlyGroupUIStore(source);
});

Inventory.onInventoryUpdate(
  'player',
  identifier => {
    const cid = Number(identifier);
    const player = charModule.getPlayerByCitizenId(cid);
    if (!player) return;
    nameManager.updatePlayerName(player);
  },
  'vpn'
);

// Check if ply cid is in active group, if so update serverid
Core.onPlayerLoaded(playerData => {
  // Reload ply store to reset UI group if switched chars
  if (!playerData.serverId) return;
  groupManager.seedPlayerStore(playerData.serverId, playerData.citizenid);

  const group = groupManager.getGroupByCID(playerData.citizenid);
  if (!group) return;
  group.updateMemberServerId(playerData.citizenid, playerData.serverId);
});

// If still in group when unloading, update serverid to null
Core.onPlayerUnloaded((_, cid) => {
  const group = groupManager.getGroupByCID(cid);
  if (!group) return;
  group.updateMemberServerId(cid, null);
});

RPC.register('dg-jobs:server:groups:create', createGroup);

RPC.register('dg-jobs:server:groups:joinRequest', (src, groupId: string) => {
  const plySteamName = Util.getName(src);
  groupLogger.silly(`[groups:joinRequest] ${plySteamName}(${src}) tries to join group with id ${groupId}`);
  const group = groupManager.getGroupById(groupId);
  if (!group) {
    groupLogger.warn(`${plySteamName}(${src}) tried to join an invalid group | id: ${groupId}`);
    // TODO: log warn with all clients
    return false;
  }
  group.requestToJoin(src);
  return true;
});

// CB to send the members of the current player group to the requestor
RPC.register('dg-jobs:server:groups:getMembers', src => {
  const plySteamName = Util.getName(src);
  groupLogger.silly(`[groups:joinRequest] ${plySteamName}(${src}) has request the members of his group`);
  const group = groupManager.getGroupByServerId(src);
  if (!group) {
    groupLogger.warn(`${plySteamName}(${src}) tried to get the members of a group while not being in a group`);
    // TODO: log warn with all clients
    return false;
  }
  const members = group.getMembers();
  return members.map(m => ({
    name: nameManager.getName(m.cid),
    ready: m.isReady,
    isOwner: m.cid == group.owner,
  }));
});

RPC.register('dg-jobs:server:groups:setReady', (src, ready: boolean) => {
  const plySteamName = Util.getName(src);
  groupLogger.silly(
    `[groups:setReady] ${plySteamName}(${src}) has set himself ${ready ? 'ready' : 'unready'} for jobs`
  );
  const cid = Util.getCID(src);
  const group = groupManager.getGroupByCID(cid);
  if (!group) {
    groupLogger.warn(`${plySteamName}(${src}) tried to set himself ready while not being in a group`);
    return false;
  }
  group.setReady(cid, ready);
  return true;
});

RPC.register('dg-jobs:server:groups:leave', src => {
  const plySteamName = Util.getName(src);
  groupLogger.silly(`[groups:leave] ${plySteamName}(${src}) has left his group`);
  const cid = Util.getCID(src);
  const group = groupManager.getGroupByCID(cid);
  if (!group) {
    groupLogger.warn(`${plySteamName}(${src}) tried to leave a group while not being in a group`);
    return true;
  }
  group.removeMember(cid);
  if (group.getMemberByCID(cid)) {
    groupLogger.error(`${plySteamName}(${src}) left a group but is still in it`);
    // TODO: log error with all clients
    return false;
  }
  return true;
});

RPC.register('dg-jobs:server:groups:get', src => {
  groupLogger.silly(`[groups:get] ${GetPlayerName(String(src))}(${src}) has requested the list of groups`);
  return getGroupList();
});

RPC.register('dg-jobs:server:groups:kick', (src, cid: number) => {
  const plySteamName = Util.getName(src);
  groupLogger.silly(`[groups:kickMember] ${plySteamName}(${src}) tries to kick player ${cid}`);
  const group = groupManager.getGroupByServerId(src);
  if (!group) {
    groupLogger.warn(`${plySteamName}(${src}) is not in a group to be able to kick`);
    return false;
  }
  group.kickMember(src, cid);
  return true;
});
