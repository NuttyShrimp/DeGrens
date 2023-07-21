import { Business, Events, Jobs, Notifications, UI, Util } from '@dgx/server';
import { insertNewVehicle } from 'db/repository';
import plateManager from 'modules/identification/classes/platemanager';
import vinManager from 'modules/identification/classes/vinmanager';
import { decreaseModelStock, getConfigByModel, getModelStock } from 'modules/info/service.info';
import { doVehicleShopTransaction, getVehicleTaxedPrice } from 'modules/vehicleshop/helpers.vehicleshop';
import { getVehicleShopConfig } from 'modules/vehicleshop/services/config.vehicleshop';
import { mainLogger } from 'sv_logger';

const jobToVehList: Record<string, string[]> = {
  police: ['pt6', 'lpgolf', 'pa6', 'lpoutlaw', 'lpmoto', 'fpskoda', 'fpm5', 'wpv90'],
  ambulance: ['ambusprinter1', 'ambusprinter2', 'mug', 'brvito', 'brblus'],
};

const jobToGarages: Record<string, string> = {
  police: 'mrpd_shared',
  ambulance: 'pillbox_shared',
};

Events.onNet('vehicles:emsShop:open', src => {
  const plyJob = Jobs.getCurrentJob(src);
  if (!plyJob || !jobToVehList[plyJob]) {
    return;
  }
  const menu: ContextMenu.Entry[] = [];
  jobToVehList[plyJob].forEach(vm => {
    const vehInfo = getConfigByModel(vm);
    if (!vehInfo) {
      return;
    }
    const vehStock = getModelStock(vm);
    menu.push({
      title: `${vehInfo.brand} ${vehInfo.name}`,
      description: `price: €${getVehicleTaxedPrice(vm)} | stock: ${vehStock}`,
      icon: 'car',
      submenu: [
        {
          title: 'Ben je zeker van je aankoop?',
          description: 'Klik hier om je aankoop te bevestigen',
          callbackURL: 'vehicles/emsShop/buy',
          data: {
            model: vm,
          },
        },
      ],
    });
  });
  UI.openContextMenu(src, menu);
});

Events.onNet('vehicles:emsShop:buy', async (src, model: string) => {
  const plyJob = Jobs.getCurrentJob(src);
  if (!plyJob || !jobToVehList[plyJob]) {
    return;
  }
  if (!jobToVehList[plyJob].includes(model)) {
    Notifications.add(src, 'Je kan dit voertuig niet aankopen', 'error');
    return;
  }

  const modelData = getConfigByModel(model);
  if (!modelData) {
    mainLogger.error(`Could not get model data for ${model}`);
    return;
  }

  if (getModelStock(model) <= 0) {
    Notifications.add(src, 'Dit voertuig is niet op stock!', 'error');
    return;
  }

  const employeeCid = Business.getBusinessOwner(getVehicleShopConfig().businessName)?.citizenid;
  if (!employeeCid) {
    Notifications.add(src, 'Er iets foutgelopen met de transactie', 'error');
    mainLogger.error('Could not find business owner cid');
    Util.Log('vehicles:emsShop:noOwner', {}, `Could not find business owner of pdm to sell vehicle`, undefined, true);
    return;
  }

  const transactionSuccesful = await doVehicleShopTransaction({
    customer: src,
    amount: modelData.price,
    comment: `Aankoop van ${modelData.brand} ${modelData.name} bij PDM`,
    taxId: getVehicleShopConfig().taxId,
  });
  if (!transactionSuccesful) {
    Notifications.add(src, 'Je hebt niet genoeg geld', 'error');
    return;
  }

  // Add vehicle to player vehicles
  const vin = vinManager.generateVin();
  const plate = plateManager.generatePlate();
  const cid = Util.getCID(src);
  await insertNewVehicle(vin, cid, model, plate, undefined, undefined, jobToGarages?.[plyJob]);
  vinManager.addPlayerVin(vin);
  plateManager.addPlayerPlate(plate);

  const taxedPrice = getVehicleTaxedPrice(model);
  decreaseModelStock(model);
  Util.Log(
    'vehicles:emsShop:boughtVehicle',
    { employeeCid, model, vin, plate, taxedPrice },
    `${Util.getName(src)} bought a vehicle (${model}) for ${taxedPrice}`,
    src
  );
  mainLogger.info(`Player ${cid} bought a vehicle (${model}) for ${taxedPrice}`);
  Notifications.add(src, `Je ${modelData.brand} ${modelData.name} staat op je te wachten in de garage!`, 'success');
});
