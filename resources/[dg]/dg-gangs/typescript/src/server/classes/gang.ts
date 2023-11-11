import { Phone, SQL, Util } from '@dgx/server';
import { dispatchCurrentGangToClient } from 'helpers';
import { charModule } from 'services/core';
import repository from 'services/repository';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import gangManager from './gangmanager';

export class Gang {
  private readonly logger: winston.Logger;
  private readonly _name: string;
  private readonly _label: string;
  private _owner: number;
  private readonly members: Gangs.Members;
  private messages: Gangs.ChatMessage[];

  constructor(name: string, label: string, owner: number) {
    this.logger = mainLogger.child({ module: `Gang-${name}` });
    this._name = name;
    this._label = label;
    this._owner = owner;
    this.members = new Map();
    this.messages = [];
    this.loadMembers();
    this.loadChatMsgs();
  }

  //#region getters/setters
  public get name() {
    return this._name;
  }
  public get label() {
    return this._label;
  }
  public get owner() {
    return this._owner;
  }
  private set owner(value: typeof this._owner) {
    this._owner = value;
  }
  //#endregion

  private loadMembers = async () => {
    const members = await repository.getGangMembers(this.name);
    members.forEach(m => this.members.set(m.cid, { ...m }));
  };

  private loadChatMsgs = async () => {
    this.messages = await repository.getChatMessage(this.name);
    this.messages.forEach(async m => {
      m.sender = await Util.getCharName(m.cid);
    });
  };

  public isMember = (cid: number) => this.members.get(cid) !== undefined;
  public isOwner = (cid: number) => this.owner === cid;
  public hasPerms = (cid: number) => this.isOwner(cid) || (this.members.get(cid)?.hasPerms ?? false);

  public addMember = (cid: number, hasPerms = false) => {
    if (this.members.has(cid)) return;
    this.members.set(cid, { cid, hasPerms });
    repository.insertNewMember(this.name, cid, hasPerms);
    dispatchCurrentGangToClient(cid, this.name);
  };

  public removeMember = (cid: number) => {
    this.members.delete(cid);
    repository.deleteMember(this.name, cid);
    dispatchCurrentGangToClient(cid, null);
  };

  public removeAllMember = () => {
    this.members.forEach(member => {
      this.removeMember(member.cid);
    });
  };

  public modifyMemberPerms = (cid: number, hasPerms: boolean) => {
    this.members.set(cid, { cid, hasPerms });
    repository.updateMemberPerms(this.name, cid, hasPerms);
  };

  public changeOwner = (cid: number) => {
    this.owner = cid;
    repository.updateGangOwner(this.name, cid);
    // Also set perms for consistency
    this.modifyMemberPerms(cid, true);
  };

  public requestPlayerToJoin = async (plyId: number, targetPlyId: number, targetCid: number) => {
    const hasAccepted = await Phone.notificationRequest(targetPlyId, {
      icon: {
        name: 'right-to-bracket',
        color: 'white',
        background: '#118C4F',
      },
      title: 'Inkomend Gangverzoek',
      description: `Join - ${this.label}`,
      id: `gang-request-${this.name}-${Date.now()}`,
    });
    if (!hasAccepted) return;

    this.addMember(targetCid);
    this.logger.info(`${targetCid} has been added to gang ${this.name} by ${plyId}`);
    Util.Log(
      'gangs:addMember',
      {
        targetCid,
        gangName: this.name,
      },
      `${Util.getName(plyId)} has added ${targetCid} to gang ${this.name}`,
      plyId
    );
  };

  public getData = async (): Promise<Gangs.Data> => {
    const members: Gangs.Data['members'] = [];
    for (const member of Array.from(this.members.values())) {
      const charName = await Util.getCharName(member.cid);
      members.push({
        cid: member.cid,
        name: charName,
        hasPerms: this.hasPerms(member.cid),
      });
    }
    return {
      name: this.name,
      label: this.label,
      owner: this.owner,
      members,
      feedMessages: this.getFeedMessages(),
    };
  };

  public getOnlineMembers = () => {
    const plyIds: number[] = [];
    for (const [cid] of this.members) {
      const plyId = charModule.getServerIdFromCitizenId(cid);
      if (!plyId) continue;
      plyIds.push(plyId);
    }
    return plyIds;
  };

  public getFeedMessages = (offset = 0) => {
    return gangManager.getFeedMessagesForGang(this.name, offset);
  };

  getChatMessages = () => {
    return this.messages;
  };

  postChatMessage = async (cid: number, message: string) => {
    const name = await Util.getCharName(cid);
    const chatMessage: Gangs.ChatMessage = {
      sender: name,
      cid,
      message,
      date: Date.now(),
      gang: this.name,
    };
    const result = await SQL.query(
      'INSERT INTO gang_app_messages (cid, message, date, gang) VALUES (?,?,?,?) RETURNING id',
      [chatMessage.cid, chatMessage.message, chatMessage.date, chatMessage.gang]
    );
    const id = result && result?.[0]?.id;
    if (!id) {
      mainLogger.error('Failed to store gang app message', { message, id });
      return;
    }
    chatMessage.id = id;
    this.messages.unshift(chatMessage);
    this.messages.sort((a, b) => b.date - a.date);
    this.messages.splice(30);
  };
}
