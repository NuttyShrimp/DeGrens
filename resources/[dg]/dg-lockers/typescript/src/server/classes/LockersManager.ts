import { DGXEvent, EventListener } from '@dgx/server/decorators';
import winston from 'winston';
import { mainLogger } from 'sv_logger';
import { Admin, Events, Financials, Notifications, Util } from '@dgx/server';
import repository from './Repository';
import { Locker } from './Locker';
import config from 'services/config';
import { getCurrentDay } from 'helpers';

@EventListener()
class LockersManager extends Util.Singleton<LockersManager>() {
  private readonly logger: winston.Logger;
  private readonly lockers: Map<Lockers.Locker['id'], Locker>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Manager' });
    this.lockers = new Map();
  }

  private registerLockers = (data: Lockers.Locker | Lockers.Locker[]) => {
    if (Array.isArray(data)) {
      data.forEach(this.registerLockers);
      return;
    }
    const locker = new Locker(data);
    this.lockers.set(locker.id, locker);
  };

  private getLocker = (id: Lockers.Locker['id'], plyId?: number) => {
    const locker = this.lockers.get(id);
    if (!locker) {
      this.logger.error(`tried to get nonexistent locker ${id}`);
      Util.Log(
        'lockers:invalidId',
        { id },
        `${plyId ? `${Util.getName(plyId)} ` : ''}tried to get nonexistent locker ${id}`,
        plyId,
        true
      );
      return;
    }
    return locker;
  };

  public loadLockers = async () => {
    const lockers = await repository.getAll();
    this.registerLockers(lockers);
    this.logger.info(`Succesfully loaded ${lockers.length} ${lockers.length > 1 ? 'lockers' : 'locker'}`);

    this.checkDebts();
  };

  // TODO: Implement the maintenance fees
  private checkDebts = () => {
    const currentDay = getCurrentDay();
    this.lockers.forEach(locker => {
      if (!locker.data.owner) return;
      if (currentDay < locker.data.paymentDay) return;
      this.logger.info('Implement debts for lockers');
    });
  };

  private getBuildData = (): Lockers.BuildData[] => {
    const lockers = [...this.lockers.values()];
    return lockers.map(l => ({ id: l.id, coords: l.data.coords, radius: l.data.radius }));
  };

  @DGXEvent('lockers:server:request')
  private _request = (src: number) => {
    Events.emitNet('lockers:client:add', src, this.getBuildData());
  };

  @DGXEvent('lockers:server:place')
  private _place = (src: number, buildData: Lockers.BuildData, price: number) => {
    if (!Admin.hasPermission(src, 'developer')) {
      Admin.ACBan(src, 'Does not have required permissions to place locker', { locker: buildData });
      return;
    }

    if (this.lockers.has(buildData.id)) {
      Notifications.add(src, `Er bestaat al een locker met dit ID (${buildData.id})`, 'error');
      return;
    }

    const locker: Lockers.Locker = {
      ...buildData,
      price,
      owner: null,
      password: null,
      paymentDay: 0,
    };

    this.registerLockers(locker);
    repository.insert(locker);
    this.logger.info(`A new locker (${locker.id}) has been placed`);
    Util.Log('lockers:placed', { ...locker }, `${Util.getName(src)} has placed a new locker (${locker.id})`, src);

    Events.emitNet('lockers:client:add', -1, [buildData]);
  };

  @DGXEvent('lockers:server:view')
  private _view = (src: number, id: Lockers.Locker['id']) => {
    const locker = this.getLocker(id);
    if (!locker) return;
    locker.view(src);
  };

  public doesPlayerOwnLocker = (plyId: number) => {
    const cid = Util.getCID(plyId);
    return [...this.lockers.values()].some(l => l.data.owner === cid);
  };

  @DGXEvent('lockers:server:open')
  private _open = (plyId: number, id: Lockers.Locker['id']) => {
    const locker = this.getLocker(id);
    if (!locker) return;
    const stashId = `locker_${locker.id}`;
    Events.emitNet('lockers:client:open', plyId, stashId, config.inventorySize);
  };

  @DGXEvent('lockers:server:changePassword')
  private _changePassword = (plyId: number, id: Lockers.Locker['id']) => {
    const locker = this.getLocker(id);
    if (!locker) return;
    locker.changePassword(plyId);
  };
}

const lockersManager = LockersManager.getInstance();
export default lockersManager;
