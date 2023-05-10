class Statebags {
  public addEntityStateBagChangeHandler = <T = never>(
    type: 'player' | 'entity',
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

        // First we await till entity exists. Both types require a different method
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

  public addCurrentVehicleStatebagChangeHandler = <T = never>(
    statebagKey: string,
    handler: (vehicle: number, value: T) => void
  ) => {
    return AddStateBagChangeHandler(
      statebagKey,
      null as any,
      (bagName: string, _key: string, value: T, _: number, fromOwnClient: boolean) => {
        if (fromOwnClient) return;

        const netId = +bagName.replace('entity:', '');
        if (isNaN(netId)) return;

        if (!NetworkDoesEntityExistWithNetworkId(netId)) return;

        const vehicle = NetworkGetEntityFromNetworkId(netId);
        const playerVehicle = GetVehiclePedIsIn(PlayerPedId(), false);
        if (playerVehicle !== vehicle) return;

        handler(vehicle, value);
      }
    );
  };
}

export default {
  Statebags: new Statebags(),
};
