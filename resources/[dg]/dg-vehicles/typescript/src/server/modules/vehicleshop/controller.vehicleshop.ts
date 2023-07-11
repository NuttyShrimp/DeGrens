import { Core, Events, Notifications, RPC, UI } from '@dgx/server';
import { getConfigByModel, getVehicleModels } from '../info/service.info';
import shopManager from './classes/ShopManager';
import { CATEGORY_LABEL, MODEL_CATEGORISATION, ModelCategorisation } from './constants.vehicleshop';
import { buildVehicleContextMenuEntry, getCategoryLabel, getVehicleTaxedPrice } from './helpers.vehicleshop';
import { vehicleshopLogger } from './logger.vehicleshop';

Core.onPlayerUnloaded(plyId => {
  if (!shopManager.playersInShop.has(plyId)) return;
  shopManager.setPlayerActive(plyId, false);
});

Events.onNet('vehicles:shop:openVehicleMenu', (src: number, spotId: number, categorisation: ModelCategorisation) => {
  if (!MODEL_CATEGORISATION.includes(categorisation)) {
    vehicleshopLogger.warn('Provided categorisation was not valid');
    return;
  }

  // Categorize vehicles
  const categorizedVehicles = getVehicleModels().reduce<Record<string, Config.CarSchema[]>>((all, model) => {
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
  const currentVehicleEntry = buildVehicleContextMenuEntry(currentVehicle, 'vehicleshop/selectModel');

  // Base context menu entries
  const menu: ContextMenu.Entry[] = [
    {
      title: 'Voertuig Shop',
      description: 'Selecteer een categorie om verder te gaan',
      disabled: true,
      icon: 'car',
    },
    {
      ...currentVehicleEntry,
      title: `Huidig voertuig: ${currentVehicleEntry.title}`,
      disabled: true,
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
          .map(vehicle => buildVehicleContextMenuEntry(vehicle, 'vehicleshop/selectModel')),
      });
    });

  UI.openContextMenu(src, menu);
});
