import { SQL } from '@dgx/server';
import { Util } from '@dgx/shared';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

class Repository extends Util.Singleton<Repository>() {
  private logger: winston.Logger;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Repository' });
  }

  public insertNewGang = async (name: string, label: string, owner: number) => {
    await SQL.insertValues('gang_info', [{ name, label, owner }]);
  };

  public insertNewMember = async (gang: string, citizenid: number, hasPerms: boolean) => {
    await SQL.insertValues('gang_members', [{ gang, citizenid, hasPerms }]);
  };

  public getAllGangs = () => {
    const query = `SELECT * FROM gang_info`;
    return SQL.query<Gangs.Gang[]>(query);
  };

  public getGangMembers = (gang: string) => {
    const query = `SELECT citizenid AS cid, hasPerms FROM gang_members WHERE gang = ?`;
    return SQL.query<Gangs.Member[]>(query, [gang]);
  };

  public deleteMember = async (gang: string, cid: number) => {
    const query = `DELETE FROM gang_members WHERE gang = ? AND citizenid = ?`;
    await SQL.query(query, [gang, cid]);
  };

  public updateMemberPerms = async (gang: string, cid: number, hasPerms: boolean) => {
    const query = `UPDATE gang_members SET hasPerms = ? WHERE gang = ? AND citizenid = ?`;
    await SQL.query(query, [hasPerms, gang, cid]);
  };

  public updateGangOwner = async (gang: string, owner: number) => {
    const query = `UPDATE gang_info SET owner = ? WHERE name = ?`;
    await SQL.query(query, [owner, gang]);
  };
}

const repository = Repository.getInstance();
export default repository;
