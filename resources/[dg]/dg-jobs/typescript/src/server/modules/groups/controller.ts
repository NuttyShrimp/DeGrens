import groupManager from './classes/GroupManager';
import nameManager from './classes/NameManager';
import { getGroupList } from './service';
import { groupLogger } from './logger';

onNet('DGCore:Server:onPlayerLoaded', () => {
  const player = DGCore.Functions.GetPlayer(source);
  nameManager.updatePlayerName(player.PlayerData.citizenid);
});

onNet('dg-jobs:client:groups:loadStore', () => {
  groupManager.seedPlayerStore(source);
});

on('DGCore:Server:OnInventoryUpdate', (src: number) => {
  const player = DGCore.Functions.GetPlayer(src);
  nameManager.updatePlayerName(player.PlayerData.citizenid);
});

on('onResourceStart', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  Object.values({
    ...DGCore.Functions.GetQBPlayers(),
  }).forEach((ply: Player) => {
    nameManager.updatePlayerName(ply.PlayerData.citizenid);
    groupManager.seedPlayerStore(ply.PlayerData.source);
  });
});

DGCore.Functions.CreateCallback('dg-jobs:server:groups:create', (src, cb) => {
  groupLogger.silly(`[groups:create] ${GetPlayerName(String(src))}(${src}) is trying to create a group`);
  groupManager.createGroup(src);
  // Check if the user is actually the owner of a group
  const group = groupManager.getGroupByServerId(src);
  cb(group !== undefined);
});

DGCore.Functions.CreateCallback('dg-jobs:server:groups:joinRequest', (src, cb, data: { id: string }) => {
  groupLogger.silly(
    `[groups:joinRequest] ${GetPlayerName(String(src))}(${src}) tries to join group with id ${data.id}`
  );
  const group = groupManager.getGroupById(data.id);
  if (!group) {
    groupLogger.warn(`${GetPlayerName(String(src))}(${src}) tried to join an invalid group | id: ${data.id}`);
    // TODO: log warn with all clients
    cb(false);
  }
  group.requestToJoin(src);
  cb(true);
});

// CB to send the members of the current player group to the requestor
DGCore.Functions.CreateCallback('dg-jobs:server:groups:getMembers', (src, cb) => {
  groupLogger.silly(`[groups:joinRequest] ${GetPlayerName(String(src))}(${src}) has request the members of his group`);
  const group = groupManager.getGroupByServerId(src);
  if (!group) {
    groupLogger.warn(
      `${GetPlayerName(String(src))}(${src}) tried to get the members of a group while not being in a group`
    );
    // TODO: log warn with all clients
    cb(false);
  }
  const members = group.getMembers();
  const groupOwner = group.getOwner();
  const UIMembers = members.map(m => ({
    name: nameManager.getName(m.cid),
    ready: m.isReady,
    isOwner: m.serverId == groupOwner.serverId,
  }));
  cb(UIMembers);
});

DGCore.Functions.CreateCallback('dg-jobs:server:groups:setReady', (src, cb, data: { ready: boolean }) => {
  groupLogger.silly(
    `[groups:setReady] ${GetPlayerName(String(src))}(${src}) has set himself ${
      data.ready ? 'ready' : 'unready'
    } for jobs`
  );
  const group = groupManager.getGroupByServerId(src);
  if (!group) {
    groupLogger.warn(`${GetPlayerName(String(src))}(${src}) tried to set himself ready while not being in a group`);
  }
  group.setReady(src, data.ready);
  cb(true);
});

DGCore.Functions.CreateCallback('dg-jobs:server:groups:leave', (src, cb) => {
  groupLogger.silly(`[groups:leave] ${GetPlayerName(String(src))}(${src}) has left his group`);
  const group = groupManager.getGroupByServerId(src);
  if (!group) {
    groupLogger.warn(`${GetPlayerName(String(src))}(${src}) tried to leave a group while not being in a group`);
  }
  group.removeMember(src);
  if (group.getMemberByServerId(src)) {
    groupLogger.error(`${GetPlayerName(String(src))}(${src}) left a group but is still in it`);
    // TODO: log error with all clients
    cb(false);
    return;
  }
  cb(true);
});

DGCore.Functions.CreateCallback('dg-jobs:server:groups:get', (src, cb) => {
  groupLogger.silly(`[groups:get] ${GetPlayerName(String(src))}(${src}) has requested the list of groups`);
  cb(getGroupList());
});
