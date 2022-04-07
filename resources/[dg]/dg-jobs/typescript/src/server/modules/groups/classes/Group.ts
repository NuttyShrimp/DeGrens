import { Phone } from '@dgx/server';
import jobManager from 'classes/jobManager';
import winston from 'winston';
import { groupLogger } from '../logger';
import groupManager from './GroupManager';
import nameManager from './NameManager';

export class Group {
  private id: string;
  private owner: Groups.Member;
  // Map with Member object on player serverIds
  private members: Map<number, Groups.Member>;
  private requestId: number;
  private activeRequests: number[];
  // Based on the job this size is see
  private maxSize: number;
  private logger: winston.Logger;

  constructor(owner: number, id: string) {
    this.id = id;
    this.members = new Map();
    this.requestId = 0;
    this.maxSize = 4;
    this.logger = groupLogger.child({ module: `GROUP - ${owner}` });
    this.owner = this.addMember(owner);
    this.activeRequests = [];
    // TODO: add log that this person created a job group
  }

  // region getters
  public getId(): string {
    return this.id;
  }

  public getOwner(): Groups.Member {
    return this.owner;
  }

  public getMembers(): Groups.Member[] {
    return [...this.members.values()];
  }

  public getLimit(): number {
    return this.maxSize;
  }

  // endregion
  // region Members
  private getMemberForClient() {
    return this.getMembers().map(m => ({
      name: nameManager.getName(m.cid),
      // If no owner is set we can know for sure this player is the owner
      isOwner: this.owner ? this.owner.serverId === m.serverId : true,
      ready: m.isReady,
    }));
  }
  private pushMembersUpdate() {
    const clientMembers: JobGroupMember[] = this.getMemberForClient();
    this.members.forEach(m => {
      emitNet('dg-jobs:client:groups:setMembers', m.serverId, clientMembers);
      emitNet(
        'dg-jobs:client:groups:setGroupOwner',
        m.serverId,
        this.owner ? this.owner.serverId === m.serverId : true
      );
    });
  }

  public getMemberByServerId(src: number) {
    return this.members.get(src);
  }

  public getMemberByCID(cid: number) {
    return this.getMembers().find(m => m.cid === cid);
  }

  public addMember(src: number) {
    const player = DGCore.Functions.GetPlayer(src);
    if (!player) {
      // TODO: log this event exception, add way so player get forced unloaded back into char screen
      return;
    }
    const member: Groups.Member = {
      serverId: player.PlayerData.source,
      name: player.PlayerData.name,
      cid: player.PlayerData.citizenid,
      job: 'unemployed',
      isReady: false,
    };
    this.members.set(src, member);
    this.logger.info(
      `${member.name}(${member.serverId}) joined ${this.owner?.name ?? member.name}(${
        this.owner?.serverId ?? member.serverId
      }) job group | size: ${this.members.size}`
    );
    // Make the new member part of the group in is UI store
    emitNet('dg-jobs:client:groups:set', src, {
      id: this.id,
      name: nameManager.getName(this.owner?.cid ?? member.cid),
      size: this.members.size,
      limit: this.maxSize,
    });
    Phone.showNotification(src, {
      id: `phone-jobs-groups-join`,
      title: 'jobcenter',
      description: 'Joined group',
      icon: 'jobcenter',
    });
    if (this.owner) {
      Phone.showNotification(this.owner.serverId, {
        id: `jobcenter-groups-joined-${src}`,
        title: 'jobcenter',
        description: `${nameManager.getName(member.cid)} joined`,
        icon: 'jobcenter',
      });
    }
    this.pushMembersUpdate();
    return member;
  }

  public removeMember(src: number) {
    if (!this.members.delete(src)) {
      // TODO: log failed attempt to leave group, src isn't member of
      this.logger.warn(
        `${GetPlayerName(String(src))}(${src}) tried to leave ${this.owner.name}(${
          this.owner.serverId
        }) job group without being part of it`
      );
      return;
    }
    this.logger.info(
      `${GetPlayerName(String(src))}(${src}) left ${this.owner.name}(${this.owner.serverId}) job group successfully`
    );
    emit('dg-jobs:server:groups:playerLeft', src);
    emitNet('dg-jobs:client:groups:set', src, null);
    emitNet('dg-jobs:client:groups:setMembers', src, []);
    emitNet('dg-jobs:client:groups:setGroupOwner', src, false);
    Phone.showNotification(src, {
      id: 'jobcenter-groups-join',
      title: 'jobcenter',
      description: 'Group verlaten',
      icon: 'jobcenter',
    });
    if (this.owner.serverId == src) {
      groupManager.disbandGroup(this.id);
    }
    this.pushMembersUpdate();
  }

  /**
   * This function sets all needed things on the client seed if a player reloads without leaving the group
   */
  public refreshMember(src: number) {
    if (!this.members.has(src)) {
      this.logger.warn(
        `${GetPlayerName(String(src))}(${src}) tried to refresh his group state with ${this.owner.name}(${
          this.owner.serverId
        }) groups info without being part of it`
      );
      // TODO: add graylog
      return;
    }
    const member = this.members.get(src);
    const clientMembers: JobGroupMember[] = this.getMemberForClient();
    emitNet('dg-jobs:client:groups:set', src, {
      id: this.id,
      name: nameManager.getName(this.owner?.cid ?? member.cid),
      size: this.members.size,
      limit: this.maxSize,
    });
    emitNet('dg-jobs:client:groups:setMembers', src, clientMembers);
    emitNet('dg-jobs:client:groups:setGroupOwner', src, this.owner ? this.owner.serverId === src : true);
  }

  // endregion

  public async setActiveJob(jobName: string) {
    // TODO: check if all members are ready
    // Get max size from enum
    const job = jobManager.getJobByName(jobName);
    if (!job) {
      this.logger.error(
        `Group(${this.id}) tried to change it job to an invalid job(${job.name}) | owner: ${this.owner.name}`
      );
      // TODO: log in graylog
      return;
    }
    this.logger.info(`Changing job to ${job.name}`);
    this.members.forEach(async m => {
      if (m.serverId == this.owner.serverId) {
        m.job = job.name;
        this.members.set(m.serverId, m);
        return;
      }
      const accepted = await Phone.notificationRequest(m.serverId, {
        id: `jobcenter-groups-jobChange-${job.name}`,
        title: 'Jobcenter',
        // TODO: replace name with title of job
        description: `Verander job naar ${job.title}`,
        timer: 15,
        icon: 'jobcenter',
      });
      if (!accepted) return;
      m.job = job.name;
      this.members.set(m.serverId, m);
    });
  }

  public async requestToJoin(src: number) {
    const player = DGCore.Functions.GetPlayer(src);
    if (!player) {
      // TODO: log this event exception, add way so player get forced unloaded back into char screen
      return;
    }
    if (this.members.size == this.maxSize) {
      emitNet('dg-jobs:client:groups:isFull', src);
      return;
    }
    if (this.activeRequests.includes(src)) {
      Phone.showNotification(src, {
        id: 'phone-jobs-groups-join',
        title: 'jobcenter',
        description: 'Toegang geweigerd',
        icon: 'jobcenter',
      });
      return;
    }
    this.activeRequests.push(src);
    this.logger.debug(`${GetPlayerName(String(src))}(${src}) requested to join the group`);
    const isAccepted = await Phone.notificationRequest(this.owner.serverId, {
      id: `jobcenter-groups-${this.requestId++}`,
      title: 'request to join',
      description: nameManager.getName(player.PlayerData.citizenid),
      icon: 'jobcenter',
      timer: 30,
    });
    if (!isAccepted) return;
    this.addMember(src);
    this.activeRequests = this.activeRequests.filter(r => r !== src);
  }

  public setReady(src: number, isReady: boolean) {
    const member = this.getMemberByServerId(src);
    if (!member) {
      this.logger.warn(
        `${GetPlayerName(String(src))}(${src}) tried to set his ready state in a group he isn\'t a member of`
      );
      // TODO: log in graylog
    }
    member.isReady = isReady;
    this.members.set(src, member);
    this.pushMembersUpdate();
  }
}
