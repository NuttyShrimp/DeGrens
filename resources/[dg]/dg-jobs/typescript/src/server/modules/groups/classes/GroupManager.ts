import { Events, Util } from '@dgx/server';
import { v4 } from 'uuid';

import { Group } from './Group';

class GroupManager extends Util.Singleton<GroupManager>() {
  /**
   * Each group has a unique id to prevent a player from trying to join the wrong group
   * because one 1 deleted during the request to join procedure
   */
  private groups: Map<string, Group>;

  constructor() {
    super();
    this.groups = new Map();
  }

  private genGroupId() {
    let id = v4();
    while (this.groups.has(id)) {
      id = v4();
    }
    return id;
  }

  public createGroup(src: number) {
    const groupId = this.genGroupId();
    const ownerCid = Util.getCID(src);
    const group = new Group(ownerCid, groupId);
    Util.Log(
      'jobs:groupmanger:create',
      {
        groupId,
      },
      `${Util.getName(src)}(${src}) created a job group`,
      src
    );
    this.groups.set(groupId, group);
  }

  public getGroups() {
    return Array.from(this.groups.values());
  }

  // Do not use this function to disband group, remove owner from group to do so, otherwise will cause infinite loop
  public disbandGroup(groupId: string) {
    const group = this.getGroupById(groupId);
    if (!group) return;
    const members = group.getMembers();
    members.forEach(m => {
      group.removeMember(m.cid);
    });
    Util.Log(
      'jobs:groupmanger:disband',
      {
        groupId,
        members,
      },
      `${group.owner}'s job group was disbanded`,
      DGCore.Functions.GetPlayerByCitizenId(group.owner).PlayerData.source
    );
    this.groups.delete(groupId);
  }

  public seedPlayerStore(plyId: number, cid: number) {
    const plyGroup = this.getGroupByCID(cid);
    if (!plyGroup) {
      Events.emitNet('dg-jobs:client:groups:set', plyId, null);
      Events.emitNet('dg-jobs:client:groups:setMembers', plyId, []);
      Events.emitNet('dg-jobs:client:groups:setGroupOwner', plyId, false);
      return;
    }
    plyGroup.refreshMember(cid);
  }

  public getGroupsForLogs() {
    const groups: { id: string; owner: { cid: number; name: string } }[] = [];
    this.groups.forEach(g => {
      const gOwner = g.getOwner();
      groups.push({
        id: g.getId(),
        owner: {
          cid: gOwner.cid,
          name: gOwner.name,
        },
      });
    });
  }

  public getGroupById(id: string) {
    return this.groups.get(id);
  }

  public getGroupByServerId(src: number) {
    return Array.from(this.groups.values()).find(group => group.getMemberByServerId(src) !== undefined);
  }

  public getGroupByCID(cid: number) {
    return Array.from(this.groups.values()).find(group => group.getMemberByCID(cid) !== undefined);
  }
}

const groupManager = GroupManager.getInstance();
export default groupManager;
