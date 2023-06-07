import { Util } from '@dgx/client';

import { allowedModels } from '../constant';

type StateBagHandler = (veh: number, value: any) => void;

let pendingStateChange: Sirens.State | null = null;

export const isSirensAllowed = (veh: number, ped: number) => {
  if (IsPedInAnyHeli(ped) || IsPedInAnyPlane(ped)) return false;
  if (!(GetPedInVehicleSeat(veh, -1) !== ped || GetPedInVehicleSeat(veh, 0) !== ped)) return false;
  const vehModel = GetEntityModel(veh);
  for (const model in allowedModels) {
    const modelHash = GetHashKey(model);
    if (vehModel === modelHash) {
      return allowedModels[model](veh);
    }
  }
  return false;
};

export const stateBagWrapper = async (stateKey: string, handler: StateBagHandler): Promise<number> => {
  return AddStateBagChangeHandler(
    `sirenState`,
    null as any,
    async (bagName: string, _key: string, value: any, _: number, replicated: boolean) => {
      const oldState = GetStateBagValue(bagName, 'sirenState');
      const veh = GetEntityFromStateBagName(bagName);
      const timeout = GetGameTimer() + 1500;

      if (veh === 0) return;

      while (!HasCollisionLoadedAroundEntity(veh)) {
        if (!DoesEntityExist(veh)) return;
        await Util.Delay(10);
        if (timeout < GetGameTimer()) return;
      }

      if (oldState && oldState[stateKey] === value[stateKey]) return;
      const amOwner = NetworkGetEntityOwner(veh) == PlayerId();

      // If we're the owner we want to use local (more responsive)
      if ((!amOwner && replicated) || (amOwner && !replicated)) return;
      handler(veh, value[stateKey]);
    }
  );
};

export const updateStateBag = <T extends keyof Sirens.State>(
  veh: number,
  key: T,
  value: Sirens.State[T],
  state?: Sirens.State
) => {
  if (!state) state = pendingStateChange === null ? Entity(veh).state.sirenState : pendingStateChange;
  if (!state) return;
  state[key] = value;
  pendingStateChange = state;
};

export const pushStateChange = (veh: number) => {
  if (!pendingStateChange) return;
  Entity(veh).state.set('sirenState', pendingStateChange, true);
};
