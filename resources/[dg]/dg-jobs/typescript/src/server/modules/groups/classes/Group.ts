import { Events, Phone, Util } from '@dgx/server';
import jobManager from 'classes/jobManager';
import winston from 'winston';

import { groupLogger } from '../logger';

import groupManager from './GroupManager';
import nameManager from './NameManager';

export class Group {
  private readonly id: string;
  public readonly owner: number; // CID
  // Map with Member object on player cids
  private readonly members: Map<number, Groups.Member>;
  private requestId: number;
  private activeRequests: number[];
  // Based on the job this size is see
  private maxSize: number;
  private readonly logger: winston.Logger;
  // Will be set to true if the group has an active job
  private currentJob: string | null;

  constructor(ownerCid: number, id: string) {
    this.id = id;
    this.owner = ownerCid;
    this.members = new Map();
    this.requestId = 0;
    this.maxSize = 4;
    this.logger = groupLogger.child({ module: `GROUP - ${ownerCid}` });
    this.activeRequests = [];
    this.currentJob = null;
    this.addOwnerAsMember();
  }

  // region getters
  public getId(): string {
    return this.id;
  }

  public getOwner() {
    const ownerMember = this.members.get(this.owner);
    if (ownerMember === undefined) {
      Util.Log(
        'jobs:group:noOwner',
        { groupId: this.id, ownerCid: this.owner, members: Array.from(this.members.values()) },
        `Owner was not a member of group ${this.id} | ownercid ${this.owner}`,
        undefined,
        true
      );
      throw new Error('Failed to get owner member of group | owner cid: ');
    }
    return ownerMember;
  }

  public getMembers(): Groups.Member[] {
    return [...this.members.values()];
  }

  public getLimit(): number {
    return this.maxSize;
  }

  public getClientInfo(): JobGroup {
    return {
      id: this.id,
      name: nameManager.getName(this.owner),
      size: this.members.size,
      limit: this.maxSize,
      idle: this.currentJob === null,
    };
  }

  public getInfo(): JobGroup & { members: Groups.Member[]; owner: Groups.Member } {
    return {
      ...this.getClientInfo(),
      members: this.getMembers(),
      owner: this.members.get(this.owner)!,
    };
  }

  public getCurrentJob() {
    return this.currentJob;
  }

  public isBusy(): boolean {
    return this.currentJob !== null;
  }

  // endregion
  // region Members
  private getMemberForClient() {
    return this.getMembers().map(m => ({
      name: nameManager.getName(m.cid),
      isOwner: this.owner === m.cid,
      ready: m.isReady,
    }));
  }

  private pushMembersUpdate() {
    const clientMembers: JobGroupMember[] = this.getMemberForClient();
    this.members.forEach(m => {
      if (m.serverId === null) return;
      Events.emitNet('dg-jobs:client:groups:setMembers', m.serverId, clientMembers);
      Events.emitNet('dg-jobs:client:groups:setGroupOwner', m.serverId, this.owner === m.cid);
    });
  }

  public getMemberByCID(cid: number) {
    return this.members.get(cid);
  }

  public getMemberByServerId(plyId: number) {
    return this.getMembers().find(m => m.serverId === plyId);
  }

  private addOwnerAsMember = () => {
    const player = DGCore.Functions.GetPlayerByCitizenId(this.owner);
    const ownerServerId = player.PlayerData.source;
    const ownerMember: Groups.Member = {
      serverId: ownerServerId,
      name: player.PlayerData.name,
      cid: this.owner,
      isReady: false,
    };
    this.members.set(this.owner, ownerMember);
    // Make the new member part of the group in is UI store
    Events.emitNet('dg-jobs:client:groups:set', ownerServerId, {
      id: this.id,
      name: nameManager.getName(this.owner),
      size: this.members.size,
      limit: this.maxSize,
    });
    Phone.showNotification(ownerServerId, {
      id: `phone-jobs-groups-create`,
      title: 'jobcenter',
      description: 'Created group',
      icon: 'jobcenter',
    });
    this.logger.info(`${ownerMember.name}(${ownerServerId}) created a job group`);
    Util.Log('jobs:group:addMember', this.getInfo(), `${ownerMember.name} joined group ${this.id}`, ownerServerId);
    this.pushMembersUpdate();
  };

  public addMember(cid: number) {
    const player = DGCore.Functions.GetPlayerByCitizenId(cid);
    if (!player) {
      // TODO: log this event exception, add way so player get forced unloaded back into char screen
      return;
    }
    const member: Groups.Member = {
      serverId: player.PlayerData.source,
      name: player.PlayerData.name,
      cid: player.PlayerData.citizenid,
      isReady: false,
    };
    this.members.set(cid, member);
    const ownerMember = this.getOwner();
    this.logger.info(
      `${member.name}(${member.serverId}) joined ${ownerMember.name}(${ownerMember.serverId}) job group | size: ${this.members.size}`
    );
    emit('dg-jobs:server:groups:playerJoined', player.PlayerData.source, player.PlayerData.citizenid, this.id);
    // Make the new member part of the group in is UI store
    Events.emitNet('dg-jobs:client:groups:set', player.PlayerData.source, {
      id: this.id,
      name: nameManager.getName(this.owner),
      size: this.members.size,
      limit: this.maxSize,
    });
    Phone.showNotification(player.PlayerData.source, {
      id: `phone-jobs-groups-join`,
      title: 'jobcenter',
      description: 'Joined group',
      icon: 'jobcenter',
    });
    if (ownerMember.serverId !== null) {
      Phone.showNotification(ownerMember.serverId, {
        id: `jobcenter-groups-joined-${player.PlayerData.source}`,
        title: 'jobcenter',
        description: `${nameManager.getName(member.cid)} joined`,
        icon: 'jobcenter',
      });
    }
    Util.Log(
      'jobs:group:addMember',
      this.getInfo(),
      `${member.name} joined group ${this.id}`,
      player.PlayerData.source
    );
    this.pushMembersUpdate();
    return member;
  }

  // Do not use this.getOwner() inside this function because theres a possibility the owner got removed while iterating this func when disbanding group!
  public removeMember(cid: number) {
    const removedMember = this.members.get(cid)!;
    if (!this.members.delete(cid)) {
      // TODO: log failed attempt to leave group, src isn't member of
      this.logger.warn(`cid ${cid} tried to leave ${this.owner} job group without being part of it`);
      return;
    }
    this.logger.info(`cid ${cid} left ${this.owner} job group successfully`);

    emit('dg-jobs:server:groups:playerLeft', removedMember.serverId, removedMember.cid, this.id);
    if (removedMember.serverId !== null) {
      Events.emitNet('dg-jobs:client:groups:set', removedMember.serverId, null);
      Events.emitNet('dg-jobs:client:groups:setMembers', removedMember.serverId, []);
      Events.emitNet('dg-jobs:client:groups:setGroupOwner', removedMember.serverId, false);
      Phone.showNotification(removedMember.serverId, {
        id: 'jobcenter-groups-join',
        title: 'jobcenter',
        description: 'Group verlaten',
        icon: 'jobcenter',
      });
    }

    Util.Log('jobs:group:removeMember', this.getInfo(), `${removedMember.name} left group ${this.id}`);

    if (this.owner === cid) {
      groupManager.disbandGroup(this.id);
    }
    this.pushMembersUpdate();
  }

  /**
   * This function sets all needed things on the client seed if a player reloads without leaving the group
   */
  public refreshMember(cid: number) {
    if (!this.members.has(cid)) {
      const ownerMember = this.getOwner();
      this.logger.warn(
        `cid ${cid} tried to refresh his group state with ${ownerMember.name}(${ownerMember.serverId}) groups info without being part of it`
      );
      // TODO: add graylog
      return;
    }
    const plyId = DGCore.Functions.GetPlayerByCitizenId(cid).PlayerData.source;
    const clientMembers: JobGroupMember[] = this.getMemberForClient();
    Events.emitNet('dg-jobs:client:groups:set', plyId, this.getClientInfo());
    Events.emitNet('dg-jobs:client:groups:setMembers', plyId, clientMembers);
    Events.emitNet('dg-jobs:client:groups:setGroupOwner', plyId, this.owner === cid);
  }

  // endregion

  public async setActiveJob(jobName: string | null) {
    if (jobName === null) {
      this.currentJob = null;
      return true;
    }
    const ownerMember = this.getOwner();
    // Get max size from enum
    const job = jobManager.getJobByName(jobName);
    if (!job) {
      this.logger.error(
        `Group(${this.id}) tried to change its job to an invalid job(${jobName}) | owner: ${ownerMember.name}`
      );
      // TODO: log in graylog
      return false;
    }
    if (this.members.size > job.size) {
      if (ownerMember.serverId !== null) {
        Phone.showNotification(ownerMember.serverId, {
          id: `jobcenter-groups-too-many-members`,
          title: 'Jobcenter',
          description: 'Te veel groepsleden',
          icon: 'jobcenter',
        });
      }
      this.logger.debug(`Group(${this.id}) tried to change its job to ${job.name} but too many members for job`);
      return false;
    }
    this.logger.info(`Changing job to ${job.name}`);
    if (this.getMembers().some(m => !m.isReady)) {
      if (ownerMember.serverId !== null) {
        Phone.showNotification(ownerMember.serverId, {
          id: `jobcenter-groups-not-ready`,
          title: 'Jobcenter',
          description: 'Nog niet iedereen is klaar',
          icon: 'jobcenter',
        });
      }
      this.logger.debug(`Group(${this.id}) tried to change it job to ${job.name} but not all members are ready`);
      return false;
    }
    Util.Log(
      'jobs:group:changeJob',
      {
        ...this.getInfo(),
        job: job.name,
      },
      `Changing job to ${job.name}`
    );
    this.currentJob = jobName;
    return true;
  }

  public async requestToJoin(src: number) {
    const player = DGCore.Functions.GetPlayer(src);
    if (!player) {
      // TODO: log this event exception, add way so player get forced unloaded back into char screen
      return;
    }
    if (this.members.size == this.maxSize) {
      Events.emitNet('dg-jobs:client:groups:isFull', src);
      return;
    }
    const ownerServerId = this.getOwner().serverId;
    if (this.activeRequests.includes(src) || ownerServerId === null) {
      Phone.showNotification(src, {
        id: 'phone-jobs-groups-join',
        title: 'Jobcenter',
        description: 'Toegang geweigerd',
        icon: 'jobcenter',
      });
      return;
    }
    this.activeRequests.push(src);
    this.logger.debug(`${GetPlayerName(String(src))}(${src}) requested to join the group`);
    const isAccepted = await Phone.notificationRequest(ownerServerId, {
      id: `jobcenter-groups-${this.requestId++}`,
      title: 'Jobcenter',
      description: `Request to join - ${nameManager.getName(player.PlayerData.citizenid)}`,
      icon: 'jobcenter',
      timer: 30,
    });
    if (!isAccepted) return;
    this.addMember(player.PlayerData.citizenid);
    this.activeRequests = this.activeRequests.filter(r => r !== src);
  }

  public setReady(cid: number, isReady: boolean) {
    const member = this.getMemberByCID(cid);
    if (!member) {
      this.logger.warn(`cid ${cid} tried to set his ready state in a group he isn't a member of`);
      // TODO: log in graylog
      return;
    }
    member.isReady = isReady;
    this.members.set(cid, member);
    this.pushMembersUpdate();
  }

  public updateMemberServerId = (cid: number, newServerId: number | null) => {
    const member = this.members.get(cid);
    if (!member) return;
    this.members.set(cid, { ...member, isReady: false, serverId: newServerId });
    this.logger.info(`Group member (${cid}) serverId got updated to ${newServerId}`);
    this.pushMembersUpdate();
  };
}
