import { Events, Phone, Util } from '@dgx/server';
import { dispatchCurrentGangToClient } from 'helpers';
import repository from 'services/repository';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

export class Gang {
  private readonly logger: winston.Logger;
  private readonly _name: string;
  private readonly _label: string;
  private _owner!: number;
  private readonly members: Gangs.Members;

  constructor(name: string, label: string, owner: number) {
    this.logger = mainLogger.child({ module: `Gang-${name}` });
    this._name = name;
    this._label = label;
    this.owner = owner;
    this.members = new Map();
    this.loadMembers();
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

  public isMember = (cid: number) => this.members.get(cid) !== undefined;
  public isOwner = (cid: number) => this.owner === cid;
  public hasPerms = (cid: number) => this.isOwner(cid) || (this.members.get(cid)?.hasPerms ?? false);

  public addMember = (cid: number, hasPerms = false) => {
    this.members.set(cid, { cid, hasPerms });
    repository.insertNewMember(this.name, cid, hasPerms);
    dispatchCurrentGangToClient(cid, this.name);
  };

  public removeMember = (cid: number) => {
    this.members.delete(cid);
    repository.deleteMember(this.name, cid);
    dispatchCurrentGangToClient(cid, null);
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

  public requestPlayerToJoin = async (plyId: number, playerData: PlayerData) => {
    const hasAccepted = await Phone.notificationRequest(playerData.source, {
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

    this.addMember(playerData.citizenid);
    this.logger.info(`${playerData.citizenid} has been added to gang ${this.name} by ${plyId}`);
    Util.Log(
      'gangs:addMember',
      {
        targetCid: playerData.citizenid,
        gangName: this.name,
      },
      `${Util.getName(plyId)} has added ${playerData.citizenid} to gang ${this.name}`,
      plyId
    );
  };

  public getClientVersion = async (): Promise<GangData> => {
    const members: GangData['members'] = [];
    for (const member of Array.from(this.members.values())) {
      const charName = await Util.getCharName(member.cid);
      members.push({
        cid: member.cid,
        name: charName,
        hasPerms: this.hasPerms(member.cid),
      });
    }
    return { name: this.name, label: this.label, owner: this.owner, members };
  };
}
