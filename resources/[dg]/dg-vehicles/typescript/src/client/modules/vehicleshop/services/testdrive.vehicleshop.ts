import { Events, Keys, Notifications, PolyZone, RPC, UI } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

let isInReturnZone = false;
let isDoingTestDrive = false;

export const requestTestDrive = async (model: string) => {
  const header = await RPC.execute<string>('vehicles:shop:getTestDriveHeader', model);
  if (!header) return;
  const result = await UI.openInput({ header });
  if (!result.accepted) return;
  Events.emitNet('vehicles:shop:testdrive:start', model);
};

Events.onNet('vehicles:shop:testdrive:buildReturn', (coords: Vec4) => {
  PolyZone.addBoxZone('pdm_return', { x: coords.x, y: coords.y, z: coords.z }, 3, 3, {
    heading: coords.w,
    minZ: coords.z - 2,
    maxZ: coords.z + 5,
    data: {},
  });
  isDoingTestDrive = true;
});

PolyZone.onEnter('pdm_return', () => {
  if (isInReturnZone) return;
  isInReturnZone = true;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Inleveren`);
});
PolyZone.onLeave('pdm_return', () => {
  if (!isInReturnZone) return;
  isInReturnZone = false;
  UI.hideInteraction();
});

Keys.onPressDown('GeneralUse', async () => {
  if (!isDoingTestDrive || !isInReturnZone) return;
  const veh = getCurrentVehicle();
  if (!veh) return;
  const returnSuccessful = await RPC.execute(
    'vehicles:shop:testdrive:returnVehicle',
    NetworkGetNetworkIdFromEntity(veh)
  );
  if (!returnSuccessful) return;
  isDoingTestDrive = false;
  PolyZone.removeZone('pdm_return');
  Notifications.add('Je hebt het voertuig ingeleverd');
});
