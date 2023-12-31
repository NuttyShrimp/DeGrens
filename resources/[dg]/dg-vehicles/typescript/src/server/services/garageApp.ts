import { Admin, Events, Financials, Notifications, Phone, RPC, Util } from '@dgx/server';

import {
  getPlayerOwnedVehicles,
  getPlayerVehicleInfo,
  insertVehicleTransferLog,
  setVehicleOwner,
  setVehicleState,
} from '../db/repository';
import { getFirstGarageSpot, getGarageById } from '../modules/garages/service.garages';
import vinManager from '../modules/identification/classes/vinmanager';
import { getConfigByModel } from '../modules/info/service.info';
import { charModule } from 'helpers/core';

Events.onNet('vehicles:server:app:trackVehicle', async (src, vin: string) => {
  if (!vinManager.doesVinExist(vin) || !vinManager.isVinFromPlayerVeh(vin)) return;
  const vehicle = await getPlayerVehicleInfo(vin);
  if (!vehicle) return;
  const cid = Util.getCID(src);
  if (!cid) return;
  if (vehicle.cid !== cid) {
    Admin.ACBan(src, `Requested location for non-owned vehicle`);
    return;
  }

  if (vehicle.state === 'impounded') {
    Notifications.add(src, 'Dit voertuig staat in beslag');
    return;
  }

  if (vehicle.state === 'out') {
    // Mark vehicle
    const vehNetId = vinManager.getNetId(vin);
    if (!vehNetId) {
      Notifications.add(src, 'Kon voertuig niet traceren');
      return;
    }
    const vehCoords = Util.getEntityCoords(NetworkGetEntityFromNetworkId(vehNetId));
    Events.emitNet('vehicles:server:app:setTrackedBlip', src, vehCoords);
    return;
  }

  const parkingSpot = getFirstGarageSpot(vehicle.garageId);
  if (!parkingSpot) return;
  Events.emitNet('vehicles:server:app:setTrackedBlip', src, parkingSpot);
});

Events.onNet('vehicles:server:app:sellVehicle', async (src, targetCID: number, vin: string, price: number) => {
  targetCID = Number(targetCID);
  price = Number(price);
  if (!vinManager.doesVinExist(vin) || !vinManager.isVinFromPlayerVeh(vin)) {
    return;
  }
  const targetServerId = charModule.getServerIdFromCitizenId(targetCID);
  if (!targetServerId) return;
  const vehicle = await getPlayerVehicleInfo(vin);
  if (!vehicle) return;
  if (vehicle.vinscratched) return;
  const cid = Util.getCID(src);
  if (!cid) return;
  if (cid === targetCID) {
    Notifications.add(src, 'Je kunt een voertuig niet aan jezelf verkopen', 'error');
    return;
  }
  if (vehicle.cid !== cid) {
    Admin.ACBan(src, `Tried selling a non-owned vehicle`);
    return;
  }
  const vehicleInfo = getConfigByModel(vehicle.model)!;
  const accepted = await Phone.notificationRequest(targetServerId, {
    id: `sell-vehicle-${vin}-${price}-${Date.now()}`,
    title: 'Buy Vehicle',
    description: `${vehicleInfo.name} - €${price}`,
    icon: 'garage',
  });
  if (!accepted) return;
  const sellerAccount = Financials.getDefaultAccountId(cid);
  const buyerAccount = Financials.getDefaultAccountId(targetCID);
  if (!sellerAccount || !buyerAccount) return;

  const success = await Financials.transfer(
    buyerAccount,
    sellerAccount,
    targetCID,
    cid,
    price,
    `Vehicle Sale of ${vehicleInfo.name}`
  );
  if (!success) {
    Notifications.add(src, 'Voertuig verkoop is gefaald omdat de koper niet genoeg geld heeft', 'error');
    return;
  }
  await setVehicleOwner(vin, targetCID);
  insertVehicleTransferLog(vin, cid, targetCID);
  Notifications.add(src, 'Voertuig successvol vergekocht', 'success');
  Notifications.add(targetServerId, 'Voertuig successvol overgekocht', 'success');
  Util.Log(
    'vehicles:garageApp:soldVehicle',
    {
      vin,
      buyerCid: targetCID,
    },
    `${Util.getName(src)}(${src}) has sold ${vin} to ${targetCID} for ${price}`
  );
});

RPC.register('vehicles:server:app:getVehicles', async src => {
  const vehicles: Garage.AppEntry[] = [];
  const cid = Util.getCID(src);
  const plyVehicles = await getPlayerOwnedVehicles(cid);
  plyVehicles.forEach(veh => {
    const vehicleGarage = getGarageById(veh.garageId);
    const vehicleInfo = getConfigByModel(veh.model);
    vehicles.push({
      vin: veh.vin,
      name: vehicleInfo?.name ?? 'NULL',
      brand: vehicleInfo?.brand ?? '',
      state: veh.state,
      engine: veh.status.engine,
      body: veh.status.body,
      plate: veh.plate,
      parking: vehicleGarage?.name ?? 'Unknown Garage',
      vinscratched: veh.vinscratched,
    });
  });
  return vehicles;
});
