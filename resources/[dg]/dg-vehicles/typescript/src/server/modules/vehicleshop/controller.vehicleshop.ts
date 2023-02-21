import { Auth, Config, Events, Notifications, RPC, UI } from '@dgx/server';

import { getConfigByModel, getVehicleModels } from '../info/service.info';

import shopManager from './classes/ShopManager';
import { getVehicleShopConfig } from './services/config.vehicleshop';
import {
  CATEGORY_LABEL,
  MODEL_CATEGORISATION,
  ModelCategorisation,
  VEHICLE_CATEGORY_TO_LABEL,
} from './constants.vehicleshop';
import {
  buildVehicleContextMenuEntry,
  getCategoryLabel,
  getTestDriveDeposit,
  getVehicleTaxedPrice,
} from './helpers.vehicleshop';
import { vehicleshopLogger } from './logger.vehicleshop';

Auth.onAuth(async plyId => {
  await Config.awaitConfigLoad();
  const shopZone = getVehicleShopConfig().shopZone;
  Events.emitNet('vehicles:shop:buildZone', plyId, shopZone);
});

on('playerDropped', () => {
  if (!shopManager.playersInShop.has(source)) return;
  shopManager.setPlayerActive(source, false);
});

Events.onNet('vehicles:shop:openVehicleMenu', (src: number, spotId: number, categorisation: ModelCategorisation) => {
  if (!MODEL_CATEGORISATION.includes(categorisation)) {
    vehicleshopLogger.warn('Provided categorisation was not valid');
    return;
  }

  // Categorize vehicles
  const categorizedVehicles = getVehicleModels().reduce<Record<string, Config.Car[]>>((all, model) => {
    if (model.shop !== 'pdm') return all; // Only pdm vehicles
    if (!all[model[categorisation]]) {
      all[model[categorisation]] = [];
    }
    all[model[categorisation]].push(model);
    return all;
  }, {});

  const modelAtSpot = shopManager.getModelAtSpot(spotId);
  if (!modelAtSpot) {
    Notifications.add(src, 'Kon huidig model niet vinden voor deze plaats', 'error');
    return;
  }
  const currentVehicle = getConfigByModel(modelAtSpot);
  if (!currentVehicle) {
    Notifications.add(src, 'Kon huidig model niet vinden voor deze plaats', 'error');
    return;
  }
  const currentVehicleEntry = buildVehicleContextMenuEntry(currentVehicle);

  // Base context menu entries
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Voertuig Shop',
      description: 'Selecteer een merk om verder te gaan',
      disabled: true,
      icon: 'car',
    },
    {
      ...currentVehicleEntry,
      title: `Huidig voertuig: ${currentVehicleEntry.title}`,
    },
    {
      title: 'Categoriseren',
      description: 'Kies de manier van categoriseren',
      icon: 'sort',
      submenu: MODEL_CATEGORISATION.map(cat => ({
        title: CATEGORY_LABEL[cat],
        callbackURL: 'vehicleshop/changeCategorisation',
        data: {
          cat,
        },
      })),
    },
  ];

  // Generate context menu and sort them alphabetically
  Object.entries(categorizedVehicles)
    .sort(([brandA], [brandB]) => brandA.localeCompare(brandB))
    .forEach(([category, vehicles]) => {
      menu.push({
        title: getCategoryLabel(categorisation, category as Category),
        submenu: vehicles
          .sort((carA, carB) => carA.class.localeCompare(carB.class))
          .map(vehicle => buildVehicleContextMenuEntry(vehicle)),
      });
    });

  UI.openContextMenu(src, menu);
});

RPC.register('vehicles:shop:getTestDriveHeader', (src: number, model: string) => {
  const maxTestDriveTime = getVehicleShopConfig().testDrive.time;
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
  return `Ben je zeker dat je de ${modelData.brand} ${
    modelData.name
  } wil testritten?\n\nGelieve het voertuig binnen de ${Math.round(
    maxTestDriveTime / 60
  )} minuten terug af te leveren.\n\nEen waarborg van €${price} zal gefactureerd worden bij de start.\nReparatiekosten zullen in rekening gebracht worden.\n\nDit bedrag wordt terugbetaald bij het inleveren van het voertuig.`;
});

RPC.register('vehicles:shop:getPurchaseHeader', (src: number, model: string) => {
  const price = getVehicleTaxedPrice(model);
  if (price === undefined) {
    vehicleshopLogger.error(`Could not get purchase price for ${model}`);
    return;
  }
  const modelData = getConfigByModel(model);
  if (!modelData) {
    vehicleshopLogger.error(`Could not get model data for ${model}`);
    return;
  }

  return `Ben je zeker dat je de ${modelData.brand} ${modelData.name} wil aanschaffen voor €${price} incl. BTW?`;
});
