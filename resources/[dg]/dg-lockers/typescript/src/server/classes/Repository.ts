import { SQL, Util } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

class Repository extends Util.Singleton<Repository>() {
  private readonly logger: winston.Logger;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Repository' });
  }

  public getAll = async (): Promise<Lockers.Locker[]> => {
    const result = await SQL.query<Lockers.DBLocker[]>('SELECT * FROM lockers');
    return result.map(r => {
      const { x, y, z, payment_day, ...data } = r;
      return {
        ...data,
        paymentDay: payment_day,
        coords: { x, y, z },
      };
    });
  };

  public insert = async (locker: Lockers.Locker) => {
    const { coords, paymentDay, ...data } = locker;
    const dbData: Lockers.DBLocker = {
      ...data,
      ...coords,
      payment_day: paymentDay,
    };
    await SQL.insertValues('lockers', [dbData]);
  };

  public updateOwner = async (id: Lockers.Locker['id'], owner: Lockers.Locker['owner']) => {
    const query = 'UPDATE lockers SET owner = ? WHERE id = ?';
    await SQL.query(query, [owner, id]);
  };

  public updatePassword = async (id: Lockers.Locker['id'], password: Lockers.Locker['password']) => {
    const query = 'UPDATE lockers SET password = ? WHERE id = ?';
    await SQL.query(query, [password, id]);
  };

  public updatePaymentDay = async (id: Lockers.Locker['id'], paymentDay: Lockers.Locker['paymentDay']) => {
    const query = 'UPDATE lockers SET payment_day = ? WHERE id = ?';
    await SQL.query(query, [paymentDay, id]);
  };
}

const repository = Repository.getInstance();
export default repository;
