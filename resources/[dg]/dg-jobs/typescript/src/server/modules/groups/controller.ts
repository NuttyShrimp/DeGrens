import { Inventory, RPC, Util } from '@dgx/server';

import groupManager from './classes/GroupManager';
import nameManager from './classes/NameManager';
import { groupLogger } from './logger';
import { changeJob, createGroup, getGroupByCid, getGroupByServerId, getGroupList, leaveGroup } from './service';

global.exports('createGroup', createGroup);
global.exports('getGroupByCid', getGroupByCid);
global.exports('getGroupByServerId', getGroupByServerId);
global.asyncExports('changeGroupJob', changeJob);
global.exports('leaveGroup', leaveGroup);

onNet('dg-jobs:client:groups:loadStore', () => {
  const cid = Util.getCID(source, true);
  if (!cid) return;
  groupManager.seedPlayerStore(cid);
});

Inventory.onInventoryUpdate(
  'player',
  identifier => {
    const cid = Number(identifier);
    nameManager.updatePlayerName(cid);
  },
  'vpn'
);

on('onResourceStart', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  (
    Object.values({
      ...DGCore.Functions.GetQBPlayers(),
    }) as Player[]
  ).forEach((ply: Player) => {
    groupManager.seedPlayerStore(ply.PlayerData.citizenid);
  });
});

// Check if ply cid is in active group, if so update serverid
on('DGCore:Server:PlayerLoaded', ({ PlayerData }: { PlayerData: PlayerData }) => {
  const group = groupManager.getGroupByCID(PlayerData.citizenid);
  if (!group) return;
  group.updateMemberInfo(PlayerData.citizenid);
});

RPC.register('dg-jobs:server:groups:create', createGroup);

RPC.register('dg-jobs:server:groups:joinRequest', (src, data: { id: string }) => {
  groupLogger.silly(
    `[groups:joinRequest] ${GetPlayerName(String(src))}(${src}) tries to join group with id ${data.id}`
  );
  const group = groupManager.getGroupById(data.id);
  if (!group) {
    groupLogger.warn(`${GetPlayerName(String(src))}(${src}) tried to join an invalid group | id: ${data.id}`);
    // TODO: log warn with all clients
    return false;
  }
  group.requestToJoin(src);
  return true;
});

// CB to send the members of the current player group to the requestor
RPC.register('dg-jobs:server:groups:getMembers', src => {
  groupLogger.silly(`[groups:joinRequest] ${GetPlayerName(String(src))}(${src}) has request the members of his group`);
  const group = groupManager.getGroupByServerId(src);
  if (!group) {
    groupLogger.warn(
      `${GetPlayerName(String(src))}(${src}) tried to get the members of a group while not being in a group`
    );
    // TODO: log warn with all clients
    return false;
  }
  const members = group.getMembers();
  const groupOwner = group.getOwner();
  return members.map(m => ({
    name: nameManager.getName(m.cid),
    ready: m.isReady,
    isOwner: m.cid == groupOwner!.cid,
  }));
});

RPC.register('dg-jobs:server:groups:setReady', (src, data: { ready: boolean }) => {
  groupLogger.silly(
    `[groups:setReady] ${GetPlayerName(String(src))}(${src}) has set himself ${
      data.ready ? 'ready' : 'unready'
    } for jobs`
  );
  const cid = Util.getCID(src);
  const group = groupManager.getGroupByCID(src);
  if (!group) {
    groupLogger.warn(`${GetPlayerName(String(src))}(${src}) tried to set himself ready while not being in a group`);
    return false;
  }
  group.setReady(cid, data.ready);
  return true;
});

RPC.register('dg-jobs:server:groups:leave', src => {
  groupLogger.silly(`[groups:leave] ${GetPlayerName(String(src))}(${src}) has left his group`);
  const cid = Util.getCID(src);
  const group = groupManager.getGroupByCID(cid);
  if (!group) {
    groupLogger.warn(`${GetPlayerName(String(src))}(${src}) tried to leave a group while not being in a group`);
    return true;
  }
  group.removeMember(cid);
  if (group.getMemberByCID(cid)) {
    groupLogger.error(`${GetPlayerName(String(src))}(${src}) left a group but is still in it`);
    // TODO: log error with all clients
    return false;
  }
  return true;
});

RPC.register('dg-jobs:server:groups:get', src => {
  groupLogger.silly(`[groups:get] ${GetPlayerName(String(src))}(${src}) has requested the list of groups`);
  return getGroupList();
});

RegisterCommand(
  'testgroups',
  () => {
    console.log(groupManager.getGroups().map(g => ({ ...g, members: g.getMembers() })));
  },
  false
);
