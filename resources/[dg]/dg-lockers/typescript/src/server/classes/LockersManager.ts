import { DGXEvent, DGXLocalEvent, EventListener } from '@dgx/server/decorators';
import winston from 'winston';
import { mainLogger } from 'sv_logger';
import { Admin, Events, Financials, Notifications, Util } from '@dgx/server';
import repository from './Repository';
import { Locker } from './Locker';

@EventListener()
class LockersManager extends Util.Singleton<LockersManager>() {
  private readonly logger: winston.Logger;
  private readonly lockers: Map<Lockers.Locker['id'], Locker>;
  private loaded: boolean;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'Manager' });
    this.lockers = new Map();
    this.loaded = false;
  }

  private registerLocker = (data: Lockers.Locker | Lockers.Locker[]) => {
    if (Array.isArray(data)) {
      data.forEach(this.registerLocker);
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
    this.registerLocker(lockers);
    this.logger.info(`Succesfully loaded ${lockers.length} ${lockers.length > 1 ? 'lockers' : 'locker'}`);
    this.loaded = true;

    await Financials.awaitFinancialsLoaded();
    this.lockers.forEach(locker => {
      locker.checkMaintenanceFee();
    });
  };

  public distributeLockersToPlayer = async (plyId: number) => {
    await Util.awaitCondition(() => this.loaded);
    const lockers = [...this.lockers.values()];
    const buildData = lockers.map(l => ({ id: l.id, coords: l.data.coords, radius: l.data.radius }));
    Events.emitNet('lockers:client:add', plyId, buildData);
  };

  @DGXLocalEvent('lockers:server:lockerDefaulted')
  private _removeLocker = (debt: IFinancials.Debt) => {
    const locker = [...this.lockers.values()].find(l => l.data.owner === debt.cid);
    if (!locker) return;
    locker.removeOwnership();
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

    this.registerLocker(locker);
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

  public doesPlayerOwnLocker = (cid: number, includeFreeLockers = false) => {
    for (const [_, l] of this.lockers) {
      if (l.data.owner !== cid) continue;
      if (l.data.price <= 0 && !includeFreeLockers) continue;
      return true;
    }
    return false;
  };

  @DGXEvent('lockers:server:open')
  private _open = (plyId: number, id: Lockers.Locker['id']) => {
    const locker = this.getLocker(id);
    if (!locker) return;
    locker.openStash(plyId);
  };

  @DGXEvent('lockers:server:changePassword')
  private _changePassword = (plyId: number, id: Lockers.Locker['id']) => {
    const locker = this.getLocker(id);
    if (!locker) return;
    locker.changePassword(plyId);
  };

  @DGXEvent('lockers:server:transferOwnership')
  private _transferOwnership = (plyId: number, id: Lockers.Locker['id']) => {
    const locker = this.getLocker(id);
    if (!locker) return;
    locker.transferOwnership(plyId);
  };
}

const lockersManager = LockersManager.getInstance();
export default lockersManager;
