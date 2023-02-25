import { SQL, Util } from '@dgx/server';

class Repository extends Util.Singleton<Repository>() {
  public getActiveLabs = async () => {
    const query = 'SELECT * FROM active_labs';
    return await SQL.query<Labs.DBLab[]>(query);
  };

  public updateActiveLab = async (type: Labs.Type, id: number, refreshTime: number) => {
    const query =
      'INSERT INTO active_labs (type, id, refreshTime) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id = VALUES(id), refreshTime = VALUES(refreshTime)';
    await SQL.query(query, [type, id, refreshTime]);
  };
}

const repository = Repository.getInstance();
export default repository;
