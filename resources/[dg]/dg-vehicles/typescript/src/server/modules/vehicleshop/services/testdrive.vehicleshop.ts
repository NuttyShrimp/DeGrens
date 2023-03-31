import { Business, Events, Financials, Notifications, Police, RPC, Util, Vehicles } from '@dgx/server';
import { deleteVehicle, spawnVehicle } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { keyManager } from 'modules/keys/classes/keymanager';

import shopManager from '../classes/ShopManager';
import { doVehicleShopTransaction, getTestDriveDeposit } from '../helpers.vehicleshop';
import { vehicleshopLogger } from '../logger.vehicleshop';
import { getVehicleShopConfig } from '../services/config.vehicleshop';
import { getConfigByModel } from 'modules/info/service.info';

const activeTestDrives: Map<
  number,
  {
    vin: string;
    deposit: number;
    timeLimitReached: boolean;
    byEmployee: boolean;
    timeout: NodeJS.Timeout;
  }
> = new Map();

RPC.register('vehicles:shop:getTestDriveHeader', (plyId, model: string) => {
  const shopConfig = getVehicleShopConfig();

  const maxTestDriveTime = shopConfig.testDrive.time;
  const price = getTestDriveDeposit(model);
  if (price === undefined) {
    vehicleshopLogger.error(`Could not get testdrive deposit for ${price}`);
    return;
  }
  const modelData = getConfigByModel(model);
  if (!modelData) {
    vehicleshopLogger.error(`Could not get model data for ${model}`);
    return;
  }

  let header: string;
  if (Business.isPlyEmployed(shopConfig.businessName, Util.getCID(plyId))) {
    header = `Ben je zeker dat je de ${modelData.brand} ${modelData.name} wil testritten?\n\nJe bent als medewerker verantwoordelijk dat dit voertuig terug gezet wordt. Misbruik zal bestraft worden`;
  } else {
    header = `Ben je zeker dat je de ${modelData.brand} ${
      modelData.name
    } wil testritten?\n\nGelieve het voertuig binnen de ${Math.round(
      maxTestDriveTime / 60
    )} minuten terug af te leveren.\n\nEen waarborg van €${price} zal gefactureerd worden bij de start.\nReparatiekosten zullen in rekening gebracht worden.\n\nDit bedrag wordt terugbetaald bij het inleveren van het voertuig.`;
  }

  return header;
});

Events.onNet('vehicles:shop:testdrive:start', async (plyId: number, model: string) => {
  if (!shopManager.playersInShop.has(plyId)) {
    vehicleshopLogger.warn(`player ${plyId} tried to start testdrive without being in vehicleshop`);
    Util.Log(
      'vehicleshop:testdrive:notInShop',
      {
        plyId,
        model,
      },
      `${Util.getName(plyId)}(${plyId}) tried to start testdrive but was not in vehicleshop`,
      plyId,
      true
    );
    return;
  }

  const cid = Util.getCID(plyId);
  if (activeTestDrives.has(cid)) {
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

  const byEmployee = Business.isPlyEmployed(shopConfig.businessName, cid);

  const depositAmount = getTestDriveDeposit(model);
  if (depositAmount === undefined) return;

  if (!byEmployee) {
    const paid = await doVehicleShopTransaction({
      customer: plyId,
      amount: depositAmount,
      comment: `Waarborg om PDM voertuig te testritten`,
    });
    if (!paid) {
      Notifications.add(plyId, 'Kon de waarborg niet betalen', 'error');
      return;
    }
  }

  const vehVin = vinManager.generateVin();
  const vehEnt = await spawnVehicle(model, shopConfig.vehicleSpawnLocation, plyId, vehVin, `XXJENSXX`);
  if (!vehEnt) {
    Notifications.add(plyId, 'Kon voertuig niet testritten', 'error');
    if (!byEmployee) {
      Financials.addCash(plyId, depositAmount, `canceling-testdrive`);
    }
    return;
  }
  keyManager.addKey(vehVin, plyId);

  // time limit
  const timeout = setTimeout(async () => {
    const testDriveData = activeTestDrives.get(cid);
    if (!testDriveData || testDriveData.vin !== vehVin) return; // If already finished or started new one then dont cancel
    if (testDriveData.byEmployee) return;

    const netId = Vehicles.getNetIdOfVin(testDriveData.vin);
    if (!netId) return;

    const charName = await Util.getCharName(cid);
    testDriveData.timeLimitReached = true;
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
    Police.addTrackerToVehicle(netId, 2000);
  }, shopConfig.testDrive.time * 1000);

  activeTestDrives.set(cid, {
    vin: vehVin,
    deposit: depositAmount,
    timeLimitReached: false,
    byEmployee,
    timeout,
  });
  if (!byEmployee) {
    Notifications.add(plyId, 'Gelieve het voertuig op tijd terug te brengen om de waarborg terug te krijgen');
  }
  Util.Log(
    'vehicleshop:testdrive:start',
    {
      plyId,
      model,
      price: depositAmount,
      byEmployee,
    },
    `${Util.getName(plyId)}(${plyId}) started testdrive with ${model} for ${depositAmount}`,
    plyId
  );
});

RPC.register('vehicles:shop:testdrive:returnVehicle', (plyId: number, vehNetId: number) => {
  const cid = Util.getCID(plyId);
  const testDriveData = activeTestDrives.get(cid);
  if (!testDriveData) {
    vehicleshopLogger.silly(`player ${plyId} tried to return testdrive vehicle but no testdrive was active`);
    Notifications.add(plyId, 'Je bent geen testrit aan het doen!', 'error');
    Util.Log(
      'vehicleshop:testdrive:failedReturn',
      {
        plyId,
      },
      `${Util.getName(plyId)}(${plyId}) tried to return vehicle but no testdrive was active`,
      plyId,
      true
    );
    return false;
  }

  const vin = Vehicles.getVinForNetId(vehNetId);
  if (!vin) {
    Notifications.add(plyId, 'Kon vin van voertuig niet vinden', 'error');
    return false;
  }

  if (testDriveData.vin !== vin) {
    Notifications.add(plyId, 'Dit is geen testrit voertuig', 'error');
    return false;
  }

  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  if (!veh || !DoesEntityExist(veh)) return false;

  if (!testDriveData.byEmployee) {
    if (!testDriveData.timeLimitReached) {
      const vehDamage = GetVehicleEngineHealth(veh) + GetVehicleBodyHealth(veh);
      const paybackAmount = testDriveData.deposit * (vehDamage / 2000);
      Financials.addCash(plyId, paybackAmount, 'payback-testdrive');
    } else {
      Notifications.add(plyId, 'Je tijdlimiet was verstreken dus je verliest je waarborg.');
    }
  }

  clearTimeout(testDriveData.timeout);
  activeTestDrives.delete(cid);
  deleteVehicle(veh);

  Util.Log(
    'vehicleshop:testdrive:finish',
    {
      plyId,
      timeLimitReached: testDriveData.timeLimitReached,
    },
    `${Util.getName(plyId)}(${plyId}) has finished a testdrive`,
    plyId
  );

  return true;
});
