import { Events, Financials, Notifications, Police, RPC, Util } from '@dgx/server';
import { deleteVehicle, spawnVehicle } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { keyManager } from 'modules/keys/classes/keymanager';

import shopManager from '../classes/ShopManager';
import { doVehicleShopTransaction, getTestDriveDeposit } from '../helpers.vehicleshop';
import { vehicleshopLogger } from '../logger.vehicleshop';
import { getVehicleShopConfig } from '../services/config.vehicleshop';

const activeTestDrives: Map<
  number,
  {
    netId: number;
    deposit: number;
    timeLimitReached: boolean;
  }
> = new Map();

Events.onNet('vehicles:shop:testdrive:start', async (plyId: number, model: string) => {
  if (!shopManager.playersInShop.has(plyId)) {
    vehicleshopLogger.warn(`player ${plyId} tried to start testdrive without being in vehicleshop`);
    Util.Log(
      'vehicleshop:testdrive:notInShop',
      {
        plyId,
        model,
      },
      `${Util.getName(plyId)} tried to start testdrive but was not in vehicleshop`,
      plyId,
      true
    );
    return;
  }

  if (activeTestDrives.has(plyId)) {
    Notifications.add(plyId, 'Je bent al een testrit aan het doen', 'error');
    return;
  }

  const shopConfig = getVehicleShopConfig();
  if (Util.isAnyVehicleInRange(shopConfig.vehicleSpawnLocation, 4)) {
    Notifications.add(
      plyId,
      'Er staat een voertuig in de weg, verplaats de wagen om de testrit te kunnen starten',
      'error'
    );
    return;
  }

  const depositAmount = getTestDriveDeposit(model);
  if (depositAmount === undefined) return;

  const paid = await doVehicleShopTransaction({
    customer: plyId,
    amount: depositAmount,
    comment: `Waarborg om PDM voertuig te testritten`,
  });
  if (!paid) {
    Notifications.add(plyId, 'Kon de waarborg niet betalen', 'error');
    return;
  }

  const vehVin = vinManager.generateVin();
  const vehEnt = await spawnVehicle(model, shopConfig.vehicleSpawnLocation, plyId, vehVin, `XXJENSXX`);
  if (!vehEnt) {
    Notifications.add(plyId, 'Kon voertuig niet testritten', 'error');
    Financials.addCash(plyId, depositAmount, `canceling-testdrive`);
    return;
  }
  keyManager.addKey(vehVin, plyId);
  const vehNetId = NetworkGetNetworkIdFromEntity(vehEnt);

  activeTestDrives.set(plyId, {
    netId: vehNetId,
    deposit: depositAmount,
    timeLimitReached: false,
  });
  Notifications.add(plyId, 'Gelieve het voertuig op tijd terug te brengen om de waarborg terug te krijgen');
  Events.emitNet('vehicles:shop:testdrive:buildReturn', plyId, shopConfig.vehicleSpawnLocation);
  Util.Log(
    'vehicleshop:testdrive:start',
    {
      plyId,
      model,
      price: depositAmount,
    },
    `${Util.getName(plyId)} started testdrive with ${model} for ${depositAmount}`,
    plyId
  );

  const cid = Util.getCID(plyId);
  const charName = await Util.getCharName(cid);
  setTimeout(() => {
    const testDriveData = activeTestDrives.get(plyId);
    if (!testDriveData || testDriveData.netId !== vehNetId) return; // If already finished or started new one then dont cancel
    activeTestDrives.set(plyId, { ...testDriveData, timeLimitReached: true });
    Notifications.add(plyId, 'Je tijdlimiet is verstreken', 'error');
    Police.createDispatchCall({
      title: 'Mogelijkse Voertuig Diefstal',
      description:
        'PDM meldt dat een getestritte wagen niet is teruggebracht. Bekijk GPS voor actuele locatie van de wagen.',
      vehicle: vehEnt,
      tag: '10-37',
      entries: {
        'id-card': `${charName} - ${cid}`,
      },
    });
    Police.addTrackerToVehicle(vehNetId, 2000);
  }, shopConfig.testDrive.time * 1000);
});

RPC.register('vehicles:shop:testdrive:returnVehicle', (plyId: number, vehNetId: number) => {
  const testDriveData = activeTestDrives.get(plyId);
  if (!testDriveData) {
    vehicleshopLogger.silly(`player ${plyId} tried to return testdrive vehicle but no testdrive was active`);
    Notifications.add(plyId, 'Je bent geen testrit aan het doen!', 'error');
    Util.Log(
      'vehicleshop:testdrive:failedReturn',
      {
        plyId,
      },
      `${Util.getName(plyId)} tried to return vehicle but no testdrive was active`,
      plyId,
      true
    );
    return false;
  }

  if (testDriveData.netId !== vehNetId) {
    Notifications.add(plyId, 'Dit is geen testrit voertuig', 'error');
    return false;
  }

  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return false;

  if (!testDriveData.timeLimitReached) {
    const vehDamage = GetVehicleEngineHealth(veh) + GetVehicleBodyHealth(veh);
    const paybackAmount = testDriveData.deposit * (vehDamage / 2000);
    Financials.addCash(plyId, paybackAmount, 'payback-testdrive');
  } else {
    Notifications.add(plyId, 'Je tijdlimiet was verstreken dus je verliest je waarborg.');
  }

  activeTestDrives.delete(plyId);
  deleteVehicle(veh);
  return true;
});
