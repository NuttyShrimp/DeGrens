import { Vector3 } from '@dgx/shared';
import { RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { getConfig } from 'helpers/config';
import winston from 'winston';
import { mainLogger } from 'sv_logger';
import { Events, Util } from '@dgx/server';

@RPCRegister()
class StateManager extends Util.Singleton<StateManager>() {
  private registers: {
    idx: number;
    storeId: Storerobbery.Id;
    coords: Vec3;
    canRob: boolean;
    timeout: NodeJS.Timeout | null;
  }[];
  private safeStates: Partial<Record<Storerobbery.Id, Storerobbery.SafeState>>;
  public safeHackers: Map<number, Storerobbery.Id>;
  private logger: winston.Logger;

  constructor() {
    super();
    this.registers = [];
    this.safeStates = {};
    this.safeHackers = new Map();
    this.logger = mainLogger.child({ module: 'StateManager' });
  }

  public getRegisterByCoords = (storeId: Storerobbery.Id, coords: Vec3) => {
    let registerIdx: number | undefined = undefined;
    const registerCoords = new Vector3(coords.x, coords.y, coords.z);
    for (let i = 0; i < this.registers.length; i++) {
      if (registerCoords.distance(this.registers[i].coords) < 0.1) {
        registerIdx = i;
        break;
      }
    }

    // If coord doesnt exist already
    if (registerIdx === undefined) {
      const newIdx = this.registers.length;
      const data: (typeof this.registers)[number] = {
        idx: newIdx,
        storeId,
        coords,
        canRob: true,
        timeout: null,
      };
      this.registers.push(data);
      return data;
    }

    const data = this.registers[registerIdx];
    if (data.storeId !== storeId) return;
    return data;
  };

  public getRegisterByIdx = (idx: number) => this.registers[idx];

  public setCanRob = async (plyId: number, registerIdx: number, canRob: boolean) => {
    const register = this.registers[registerIdx];
    if (register.canRob === canRob) return;

    if (register.timeout) {
      clearTimeout(register.timeout);
    }

    register.canRob = canRob;

    const plySteamName = Util.getName(plyId);
    this.logger.silly(
      `${plySteamName} changed register ${register.idx} (${register.storeId}) canRob state to ${register.canRob}`
    );
    Util.Log(
      'storerobbery:registers:stateChange',
      { ...register },
      `${plySteamName} changed register ${register.idx} (${register.storeId}) canRob state to ${register.canRob}`,
      plyId
    );

    if (register.canRob) return;
    register.timeout = setTimeout(() => {
      register.canRob = true;
      register.timeout = null;

      this.logger.silly(`Register ${register.idx} (${register.storeId}) has been refilled`);
      Util.Log(
        'storerobbery:registers:refill',
        { ...register },
        `Register ${register.idx} (${register.storeId}) has been refilled`
      );
    }, getConfig().register.refillTime * 60 * 1000);
  };

  getSafeState = (storeId: Storerobbery.Id) => (this.safeStates[storeId] ??= 'closed');

  setSafeState = (storeId: Storerobbery.Id, state: Storerobbery.SafeState) => {
    this.logger.silly(`Safe with id ${storeId} has been set to state: ${state}`);
    this.safeStates[storeId] = state;
  };
}

const stateManager = StateManager.getInstance();
export default stateManager;
