import { BlipManager, HUD, Notifications } from '@dgx/client';
import { getCurrentVehicle } from '@helpers/vehicle';
import { hasVehicleKeys } from 'modules/keys/cache.keys';
import shopManager from 'modules/vehicleshop/classes/ShopManager';
import { toggleVehicleDoor } from 'services/doors';
import { setEngineState } from 'services/engine';
import { moveToSeat } from 'services/seats';

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;
  BlipManager.removeCategory('dg-vehicles');
  HUD.removeEntry('harness-uses');
  HUD.removeEntry('nos-amount');
  shopManager.leftShop(); // Destroy vehicles inside shop
});

//#region Radial Menu handlers
on('vehicles:radial:engine', () => {
  const vehicle = getCurrentVehicle();
  if (!vehicle) return;
  if (!hasVehicleKeys(vehicle)) {
    Notifications.add('Je hebt geen sleutels', 'error');
    return;
  }
  const curState = GetIsVehicleEngineRunning(vehicle);
  setEngineState(vehicle, !curState);
});

on('vehicles:radial:door', (data: { doorId: number }) => {
  const veh = getCurrentVehicle();
  if (!veh) return;
  if (!GetIsDoorValid(veh, data.doorId)) {
    Notifications.add('Dit voertuig heeft deze deur niet', 'error');
    return;
  }
  toggleVehicleDoor(veh, data.doorId);
});

on('vehicles:radial:seat', (data: { seatId: number }) => {
  const veh = getCurrentVehicle();
  if (!veh) return;
  moveToSeat(veh, data.seatId);
});
//#endregion
