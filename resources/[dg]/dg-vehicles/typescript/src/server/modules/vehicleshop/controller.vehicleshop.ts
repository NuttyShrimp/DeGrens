import { Auth, Config, Events, RPC, UI } from '@dgx/server';

import { getConfigByModel, getModelStock, getVehicleModels } from '../info/service.info';

import shopManager from './classes/ShopManager';
import { getVehicleShopConfig } from './services/config.vehicleshop';
import { CATEGORY_LABEL, MODEL_CATEGORISATION, VEHICLE_CATEGORY_TO_LABEL } from './constants.vehicleshop';
import { getTestDriveDeposit, getVehicleTaxedPrice } from './helpers.vehicleshop';
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

Events.onNet('vehicles:shop:openVehicleMenu', (src: number, categorisation: typeof MODEL_CATEGORISATION[number]) => {
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

  // Base context menu entries
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Voertuig Shop',
      description: 'Selecteer een merk om verder te gaan',
      disabled: true,
      icon: 'car',
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

  const getCategoryLabel = (cat: string) => {
    switch (categorisation) {
      case 'brand':
        return cat;
      case 'category':
        return VEHICLE_CATEGORY_TO_LABEL[cat as Category] ?? 'Geen Category';
      case 'class':
        return `Klasse: ${cat}`;
    }
  };

  // Generate context menu and sort them alphabetically
  Object.entries(categorizedVehicles)
    .sort(([brandA], [brandB]) => brandA.localeCompare(brandB))
    .forEach(([category, vehicles]) => {
      menu.push({
        title: getCategoryLabel(category),
        submenu: vehicles
          .sort((carA, carB) => carA.class.localeCompare(carB.class))
          .map(vehicle => {
            const stock = getModelStock(vehicle.model);
            return {
              title: `${vehicle.brand} ${vehicle.name}`,
              description: `Prijs: €${getVehicleTaxedPrice(vehicle.model)} incl. BTW | Klasse: ${
                vehicle.class
              } | Voorraad: ${stock}`,
              callbackURL: 'vehicleshop/selectModel',
              data: {
                model: vehicle.model,
              },
              preventCloseOnClick: true,
            } as ContextMenu.Entry;
          }),
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
