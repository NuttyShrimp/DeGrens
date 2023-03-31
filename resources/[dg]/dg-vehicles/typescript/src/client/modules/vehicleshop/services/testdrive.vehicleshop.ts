import { Events, Keys, Notifications, PolyZone, RPC, UI } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';

let isInReturnZone = false;

export const requestTestDrive = async (model: string) => {
  const header = await RPC.execute<string>('vehicles:shop:getTestDriveHeader', model);
  if (!header) return;
  const result = await UI.openInput({ header });
  if (!result.accepted) return;
  Events.emitNet('vehicles:shop:testdrive:start', model);
};

PolyZone.onEnter('pdm_return', () => {
  if (isInReturnZone) return;

  isInReturnZone = true;
  if (getCurrentVehicle()) {
    UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Inleveren`);
  }
});
PolyZone.onLeave('pdm_return', () => {
  if (!isInReturnZone) return;

  isInReturnZone = false;
  UI.hideInteraction();
});

Keys.onPressDown('GeneralUse', async () => {
  if (!isInReturnZone) return;

  const veh = getCurrentVehicle();
  if (!veh) return;

  const returnSuccessful = await RPC.execute(
    'vehicles:shop:testdrive:returnVehicle',
    NetworkGetNetworkIdFromEntity(veh)
  );
  if (!returnSuccessful) return;

  Notifications.add('Je hebt het voertuig ingeleverd');
});
