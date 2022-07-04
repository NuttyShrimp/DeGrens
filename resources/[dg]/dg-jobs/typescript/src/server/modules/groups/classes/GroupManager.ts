import { Util } from '@dgx/server';
import { v4 } from 'uuid';

import { Group } from './Group';

class GroupManager {
  private static instance: GroupManager;
  public static getInstance() {
    if (!this.instance) {
      this.instance = new GroupManager();
    }
    return this.instance;
  }

  /**
   * Each group has a unique id to prevent a player from trying to join the wrong group
   * because one 1 deleted during the request to join procedure
   */
  private groups: Map<string, Group>;

  constructor() {
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
    const group = new Group(src, groupId);
    Util.Log(
      'jobs:groupmanger:create',
      {
        groupId,
      },
      `${GetPlayerName(String(src))}(${src}) created a job group`,
      src
    );
    this.groups.set(groupId, group);
  }
  public getGroups() {
    return Array.from(this.groups.values());
  }

  public disbandGroup(groupId: string) {
    const group = this.getGroupById(groupId);
    const members = group.getMembers();
    members.forEach(m => {
      group.removeMember(m.serverId);
    });
    Util.Log(
      'jobs:groupmanger:disband',
      {
        groupId,
        members,
      },
      `${group.getOwner().name}'s job group was disbanded`,
      group.getOwner().serverId
    );
    this.groups.delete(groupId);
  }

  public seedPlayerStore(src: number) {
    const plyGroup = this.getGroupByServerId(src);
    if (!plyGroup) return;
    plyGroup.refreshMember(src);
  }

  public getGroupsForLogs() {
    const groups: { id: string; owner: { serverId: number; name: string } }[] = [];
    this.groups.forEach(g => {
      const gOwner = g.getOwner();
      groups.push({
        id: g.getId(),
        owner: {
          serverId: gOwner.serverId,
          name: gOwner.name,
        },
      });
    });
  }
  public getGroupById(id: string) {
    return this.groups.get(id);
  }
  public getGroupByServerId(src: number) {
    let group: Group;
    this.groups.forEach(g => {
      if (g.getMemberByServerId(src)) {
        group = g;
      }
    });
    return group;
  }
  public getGroupByCID(cid: number) {
    let group: Group;
    this.groups.forEach(g => {
      if (g.getMemberByCID(cid)) {
        group = g;
      }
    });
    return group;
  }
}

const groupManager = GroupManager.getInstance();

export default groupManager;
