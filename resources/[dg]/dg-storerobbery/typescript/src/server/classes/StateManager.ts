import { Util, Vector3 } from '@dgx/shared';
import { RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { getConfig } from 'helpers/config';
import winston from 'winston';
import { mainLogger } from 'sv_logger';

@RPCRegister()
class StateManager extends Util.Singleton<StateManager>() {
  private robbedRegisters: Vec3[];
  private safeStates: Partial<Record<Store.Id, Safe.State>>;
  private safeHackers: Partial<Record<Store.Id, number | null>>;
  private logger: winston.Logger;

  constructor() {
    super();
    this.robbedRegisters = [];
    this.safeStates = {};
    this.safeHackers = {};
    this.logger = mainLogger.child({ module: 'StateManager' });
  }

  @RPCEvent('storerobbery:server:isRegisterRobbed')
  private _isRegisterRobbed = (_src: number, register: Vector3) => {
    const registerCoords = new Vector3(register.x, register.y, register.z);
    const isRobbed = this.robbedRegisters.find(coord => registerCoords.distance(coord) < 0.1);
    return isRobbed !== undefined;
  };

  setRegisterAsRobbed = async (register: Vec3) => {
    this.robbedRegisters.push(register);
    const timeout = (await getConfig()).register.refillTime * 60 * 1000;
    this.logger.silly(`Register at x: ${register.x} y: ${register.y} z: ${register.z} has been robbed`);
    setTimeout(() => {
      this.robbedRegisters.shift(); // because we always have the same timeout, the first one will always be the oldest
      this.logger.silly(`Register at x: ${register.x} y: ${register.y} z: ${register.z} has been refilled`);
    }, timeout);
  };

  @RPCEvent('storerobbery:server:getSafeState')
  private _getSafeState = (_src: number, storeId: Store.Id) => {
    return this.getSafeState(storeId);
  };

  getSafeState = (storeId: Store.Id) => {
    if (!this.safeStates[storeId]) this.safeStates[storeId] = 'closed';
    return this.safeStates[storeId];
  };

  setSafeState = (storeId: Store.Id, state: Safe.State) => {
    this.logger.silly(`Safe with id ${storeId} has been set to state: ${state}`);
    this.safeStates[storeId] = state;
  };

  setSafeHacker = (storeId: Store.Id, src: number | null) => {
    this.logger.silly(`Player ${src} has been registered as hacker for safe ${storeId}`);
    this.safeHackers[storeId] = src;
  };

  @RPCEvent('storerobbery:server:isSafeHacker')
  private _isSafeHacker = (src: number, storeId: Store.Id) => {
    if (this.safeStates[storeId] !== 'decoding') return false;
    return this.safeHackers[storeId] == src;
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
