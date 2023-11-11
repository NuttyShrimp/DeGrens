import { SQL, Util } from '@dgx/server';
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

  public getAllFeedMessages = async (): Promise<Gangs.Feed.Message[]> => {
    const result = await SQL.query<Gangs.Feed.Message[]>('SELECT * FROM gang_feed_messages ORDER BY date ASC');
    if (!result) return [];
    return result;
  };

  public insertFeedMessage = async (newMessage: Gangs.Feed.NewMessage): Promise<Gangs.Feed.Message | undefined> => {
    const result = await SQL.query<Gangs.Feed.Message[]>(
      'INSERT INTO gang_feed_messages (title, content, gang, date) VALUES (?, ?, ?, ?) RETURNING *',
      [newMessage.title, newMessage.content, newMessage.gang ?? null, Date.now()]
    );
    if (!result) return;
    return result[0];
  };

  public removeFeedMessage = async (messageId: number) => {
    const results = await SQL.query('DELETE FROM gang_feed_messages WHERE id=?', [messageId]);
    return results.affectedRows > 0;
  };

  public removeGang = async (gang: string) => {
    await SQL.query('DELETE FROM gang_info WHERE name = ?', [gang]);
  };

  getChatMessage = async (gangName: string) => {
    const msgs = await SQL.query('SELECT * FROM gang_app_messages where gang = ? ORDER BY date DESC LIMIT 30', [
      gangName,
    ]);
    return msgs ?? [];
  };
}

const repository = Repository.getInstance();
export default repository;
