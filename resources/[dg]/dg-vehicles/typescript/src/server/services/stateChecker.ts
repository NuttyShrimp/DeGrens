import { Events } from '@dgx/server';
import { getVehicleType } from 'modules/info/service.info';
import { mainLogger } from 'sv_logger';

const changeHistory = new Set<{ vehicle: number; key: string; value: any; timeStamp: number }>();

AddStateBagChangeHandler(
  //@ts-ignore
  null,
  //@ts-ignore
  null,
  (bagName: string, stateKey: string, stateValue: any, _: any, replicated: boolean) => {
    // Client doesn't get update so no worries
    if (!replicated) return;
    if (!bagName.startsWith('entity:')) return;
    const netId = Number(bagName.replace('entity:', ''));
    if (Number.isNaN(netId)) return;
    const veh = NetworkGetEntityFromNetworkId(netId);
    if (!getVehicleType(veh)) return;
    changeHistory.add({
      vehicle: veh,
      key: stateKey,
      value: stateValue,
      timeStamp: Date.now(),
    });
  }
);

Events.onNet('vehicles:state:change', (src: number, vehicle: number, key: string, value: any) => {
  const curTimeStamp = Date.now();
  let isRegistered = false;
  changeHistory.forEach(entry => {
    if (!(entry.vehicle == vehicle || entry.key == key || entry.value == value)) return;
    if (entry.timeStamp < curTimeStamp - 15000 || entry.timeStamp > curTimeStamp + 15000) return;
    isRegistered = true;
  });
  if (isRegistered) return;
  mainLogger.error(
    `${GetPlayerName(
      String(src)
    )}(${src}) client change the state of a vehicle but the server did not register anything, Possible cheater`
  );
  // Add anti-cheat measurments
});
