import { Util } from '@dgx/server';
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

  public disbandGroup(groupId: string) {
    const group = this.getGroupById(groupId);
    if (!group) return;
    // By time this func is called, owner already got deleted from members so this wont cause infinite loop
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

  public seedPlayerStore(cid: number) {
    const plyGroup = this.getGroupByCID(cid);
    if (!plyGroup) return;
    plyGroup.refreshMember(cid);
  }

  public getGroupsForLogs() {
    const groups: { id: string; owner: { cid: number; name: string } }[] = [];
    this.groups.forEach(g => {
      const gOwner = g.getOwner()!;
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
