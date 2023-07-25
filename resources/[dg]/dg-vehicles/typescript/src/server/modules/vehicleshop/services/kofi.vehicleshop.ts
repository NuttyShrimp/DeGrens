import { Events, Notifications, SQL, UI, Util } from '@dgx/server';
import { decreaseModelStock, getConfigByModel } from 'modules/info/service.info';
import { vehicleshopLogger } from '../logger.vehicleshop';
import { buildVehicleContextMenuEntry, doVehicleShopTransaction, getVehicleTaxedPrice } from '../helpers.vehicleshop';
import { getPlayerVehicleInfo, insertNewVehicle, setVehicleState } from 'db/repository';
import plateManager from 'modules/identification/classes/platemanager';
import vinManager from 'modules/identification/classes/vinmanager';
import { mainLogger } from 'sv_logger';
import { getVehicleShopConfig } from './config.vehicleshop';
import { spawnOwnedVehicle } from 'helpers/vehicle';

global.exports('addVehicleToKofiShopForCID', async (plyId: number, targetCID: number, model: string) => {
  if (!getConfigByModel(model)) {
    Notifications.add(plyId, 'Model staat niet in config');
    return;
  }
  await SQL.query('INSERT INTO kofi_vehicleshop (cid, model) VALUES (?, ?)', [targetCID, model]);
  const logMsg = `${Util.getName(plyId)}(${plyId}) added ${model} to kofi shop for ${targetCID}`;
  vehicleshopLogger.info(logMsg);
  Util.Log('vehicleshop:kofi:add', { model, targetCID }, logMsg, plyId);
});

const getAvailableConfigVehicles = async (cid: number) => {
  const availableVehicles = await SQL.query<{ model: string }[]>('SELECT model FROM kofi_vehicleshop WHERE cid = ?', [
    cid,
  ]);
  return (availableVehicles ?? []).map(({ model }) => model);
};

Events.onNet('vehicles:shop:openKofiShop', async plyId => {
  const cid = Util.getCID(plyId);
  const availableVehicles = await getAvailableConfigVehicles(cid);

  const menuEntries: ContextMenu.Entry[] = [
    {
      title: 'Kofi Shop',
      description: 'Klik hier om een voertuig te kopen',
      disabled: true,
      icon: 'car',
    },
  ];

  for (const model of availableVehicles) {
    const vehicleConfig = getConfigByModel(model);
    if (!vehicleConfig) continue;

    menuEntries.push({
      ...buildVehicleContextMenuEntry(vehicleConfig, undefined, false, false),
      submenu: [
        {
          title: 'Confirm',
          icon: 'check',
          callbackURL: 'vehicleshop/kofi/choose',
          data: {
            model,
          },
        },
      ],
    });
  }

  if (menuEntries.length === 1) {
    menuEntries.push({
      title: 'Geen voertuigen beschikbaar',
      disabled: true,
      icon: 'car',
    });
  }

  UI.openContextMenu(plyId, menuEntries);
});

Events.onNet('vehicles:shop:buyKofiVehicle', async (plyId, model: string) => {
  const cid = Util.getCID(plyId);

  const vehicleConfig = getConfigByModel(model);
  if (!vehicleConfig) return;
  const vehicleName = `${vehicleConfig.brand} ${vehicleConfig.name}`;

  const spawnPosition = getVehicleShopConfig().kofiShopVehicleSpawn;
  if (Util.isAnyVehicleInRange(spawnPosition, 4)) {
    Notifications.add(
      plyId,
      'Er staat een voertuig in de weg, verplaats de wagen om de aankoop te kunnen voltooien',
      'error'
    );
    return;
  }

  const transactionSuccesful = await doVehicleShopTransaction({
    customer: plyId,
    amount: vehicleConfig.price,
    comment: `Aankoop van ${vehicleName} bij Kofi Shop`,
    taxId: getVehicleShopConfig().taxId,
  });
  if (!transactionSuccesful) {
    Notifications.add(plyId, 'Je hebt niet genoeg geld', 'error');
    return;
  }

  const vin = vinManager.generateVin();
  const plate = plateManager.generatePlate();
  await insertNewVehicle(vin, cid, model, plate);
  vinManager.addPlayerVin(vin);
  plateManager.addPlayerPlate(plate);

  await SQL.query('DELETE FROM kofi_vehicleshop WHERE cid = ? AND model = ?', [cid, model]);

  const vehicleInfo = await getPlayerVehicleInfo(vin);
  if (!!vehicleInfo) {
    const vehicle = await spawnOwnedVehicle(plyId, vehicleInfo, spawnPosition);
    if (!!vehicle) {
      await setVehicleState(vin, 'out');
      Notifications.add(plyId, `Je ${vehicleName} staat op je te wachten aan de garage achteraan!`, 'success');
    } else {
      Notifications.add(
        plyId,
        'Kon je voertuig niet uithalen. Bekijk de vehiclesapp om je voertuig te vinden',
        'error'
      );
    }
  } else {
    Notifications.add(plyId, 'Er is iets foutgelopen met het uithalen van het voertuig', 'error');
    mainLogger.error('Could not get vehicle info after buying vehicle from kofi shop');
  }

  const taxedPrice = getVehicleTaxedPrice(model);
  const logMsg = `${Util.getName(plyId)}(${plyId}) bought a kofi vehicle (${model}) for ${taxedPrice}`;
  Util.Log('vehicleshop:kofi:buy', { model, vin, plate, taxedPrice }, logMsg, plyId);
  mainLogger.info(logMsg);
});
