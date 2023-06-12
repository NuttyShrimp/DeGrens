import { Financials, Notifications, RPC, TaxIds, Util } from '@dgx/server';
import {
  deleteOwnedVehicle,
  getPlayerVehicleInfo,
  getVehicleCosmeticUpgrades,
  updateVehicleStock,
} from 'db/repository';
import { deleteVehicle, getVinForNetId } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { isPlayerVehicleOwner } from 'modules/identification/service.id';
import { getConfigByModel } from 'modules/info/service.info';
import { getVehicleShopConfig } from './config.vehicleshop';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

const getQuicksellPrice = async (vin: string) => {
  if (!vinManager.isVinFromPlayerVeh(vin)) return;

  const vehicleInfo = await getPlayerVehicleInfo(vin);
  if (!vehicleInfo) return;

  const modelConfig = getConfigByModel(vehicleInfo.model);
  if (!modelConfig) return;

  const allUpgrades = await getVehicleCosmeticUpgrades(vin);
  if (!allUpgrades) return;

  const quicksellConfig = getVehicleShopConfig().quicksell;
  const allowedUpgrades = new Set(quicksellConfig.allowedUpgrades);
  const boughtUpgrades = Object.fromEntries(
    (Object.entries(allUpgrades) as ObjEntries<typeof allUpgrades>).filter(
      ([key, value]) => allowedUpgrades.has(key) && value !== -1
    )
  ) as Partial<Vehicles.Upgrades.Cosmetic.Upgrades>;

  const upgradesPrice = upgradesManager.calculatePriceForUpgrades(modelConfig.class, boughtUpgrades);

  const price = (upgradesPrice + modelConfig.price) * quicksellConfig.percentage;
  return Financials.getTaxedPrice(price, TaxIds.Vehicles, true).taxPrice;
};

RPC.register('vehicles:quicksell:getPrice', async (src, netId: number) => {
  const vin = getVinForNetId(netId);
  if (!vin) return;
  const price = await getQuicksellPrice(vin);
  if (!price) return;
  return price;
});

RPC.register('vehicles:quicksell:sellVehicle', async (plyId: number, netId: number) => {
  const targetVehicle = NetworkGetEntityFromNetworkId(netId);
  const plyPed = GetPlayerPed(String(plyId));
  const plyVehicle = GetVehiclePedIsIn(plyPed, false);
  if (!plyVehicle || !DoesEntityExist(plyVehicle) || targetVehicle !== plyVehicle) return false;
  if (GetPedInVehicleSeat(targetVehicle, -1) !== plyPed) return false;

  const targetVin = getVinForNetId(netId);
  if (!targetVin) return false;
  const isOwner = isPlayerVehicleOwner(plyId, targetVin);
  if (!isOwner) return false;

  const price = await getQuicksellPrice(targetVin);
  if (price === undefined) return false;

  const vehicleInfo = await getPlayerVehicleInfo(targetVin);
  if (!vehicleInfo) return false;
  const modelInfo = getConfigByModel(vehicleInfo.model);
  if (!modelInfo) return false;

  // Delete vehicle entity
  TaskLeaveVehicle(plyPed, targetVehicle, 256);
  await Util.Delay(1500);
  deleteVehicle(targetVehicle);

  // Pay da moneeeys
  const cid = Util.getCID(plyId);
  const playerAccountId = Financials.getDefaultAccountId(cid);
  if (!playerAccountId) return false;
  const transactionSuccesful = await Financials.transfer(
    'BE1',
    playerAccountId,
    cid,
    cid,
    price,
    `Quicksell van ${modelInfo.brand} ${modelInfo.name} (${targetVin})`
  );
  if (!transactionSuccesful) {
    Notifications.add(plyId, 'Er is iets foutgelopen bij de betaling', 'error');
    return;
  }

  await deleteOwnedVehicle(targetVin);
  updateVehicleStock(vehicleInfo.model, 1);

  return true;
});
