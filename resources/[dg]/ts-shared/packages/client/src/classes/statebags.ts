import { BaseEvents } from './index';

class Statebags {
  public addEntityStateBagChangeHandler = <T = never>(
    type: 'player' | 'entity' | 'localEntity',
    statebagKey: string,
    handler: (id: number, entity: number, value: T) => void
  ): number => {
    return AddStateBagChangeHandler(
      statebagKey,
      null as any,
      async (bagName: string, _key: string, value: T, _: number, fromOwnClient: boolean) => {
        // We could theoretically use this for snappier feeling, but introduces bugs when entering scope of obj with statebag
        if (fromOwnClient) return;

        // Can be playerServerId or entityNetId
        const bagId = +bagName.replace(`${type}:`, '');
        if (isNaN(bagId)) return;

        // First we await till entity exists. All types require a different method
        const [exists, entity] = await new Promise<[false] | [true, number]>(res => {
          let timedOut = false;
          setTimeout(() => (timedOut = true), 1000);

          const t = setInterval(() => {
            if (timedOut) {
              clearInterval(t);
              res([false]);
              return;
            }

            let entity: number | undefined;
            if (type === 'player') {
              const localPlayerId = GetPlayerFromServerId(bagId);
              // means ply when out of scope again
              if (localPlayerId === -1) {
                clearInterval(t);
                res([false]);
                return;
              }
              entity = GetPlayerPed(localPlayerId);
            } else if (type === 'entity') {
              if (NetworkDoesEntityExistWithNetworkId(bagId)) {
                entity = NetworkGetEntityFromNetworkId(bagId);
              }
            } else if (type === 'localEntity') {
              entity = bagId;
            } else {
              throw new Error(`Invalid type ${type}`);
            }

            if (!entity) return;
            if (!DoesEntityExist(entity)) {
              entity = undefined;
              return;
            }

            clearInterval(t);
            res([true, entity]);
          }, 1);
        });
        if (!exists) return;

        handler(bagId, entity, value);
      }
    );
  };

  public addCurrentVehicleStatebagChangeHandler = <T>(
    statebagKey: string,
    handler: (vehicle: number, value: T) => void
  ) => {
    let statebagHandlerId: number | null = null;

    BaseEvents.onEnteredVehicle(vehicle => {
      if (statebagHandlerId !== null) {
        RemoveStateBagChangeHandler(statebagHandlerId);
        console.error(`Statebag handler still existed when entering vehicle ${vehicle}`);
      }

      statebagHandlerId = AddStateBagChangeHandler(
        statebagKey,
        null as any,
        (bagName: string, _key: string, value: T, _: number, fromOwnClient: boolean) => {
          if (fromOwnClient) return;

          const netId = +bagName.replace('entity:', '');
          if (isNaN(netId) || !NetworkDoesEntityExistWithNetworkId(netId)) return;

          const ent = NetworkGetEntityFromNetworkId(netId);
          if (ent !== vehicle) return;

          handler(vehicle, value);
        }
      );
    });

    BaseEvents.onLeftVehicle(() => {
      if (statebagHandlerId === null) return;
      RemoveStateBagChangeHandler(statebagHandlerId);
      statebagHandlerId = null;
    });
  };
}

export default {
  Statebags: new Statebags(),
};
