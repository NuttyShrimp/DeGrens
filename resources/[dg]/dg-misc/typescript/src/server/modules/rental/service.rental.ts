import { Admin, Config, Financials, Inventory, Notifications, Phone, UI, Util, Vehicles } from '@dgx/server';

import { rentalLogger } from './logger.rental';

let config: Rentals.Config;

export const getLocations = () => config.locations;

export const loadConfig = async () => {
  await Config.awaitConfigLoad();
  config = Config.getModuleConfig('rentals');
};

const getSpawnLocation = (locId: string): Vec4 | undefined => {
  const spawns = config.locations.find(l => l.id === locId)?.spawns ?? [];
  if (spawns.length === 0) return;
  const spawn = spawns.find(s => !Util.isAnyVehicleInRange(s, 2));
  return spawn;
};

export const openRentList = (src: number, id: string) => {
  const location = config.locations.find(l => l.id === id);
  if (!location) return;
  const coords = Util.getPlyCoords(src);
  if (coords.distance(location.coords) > 10) {
    Admin.ACBan(src, 'tried to open rental list when not on location', {
      locationId: id,
    });
    return;
  }
  const vehicles = config.vehicles.filter(v => v.locations.includes(id));
  UI.openContextMenu(
    src,
    vehicles.map(v => ({
      id: `rent-${v.model}`,
      title: Vehicles.getConfigByModel(v.model)?.name ?? v.model,
      description: `price: €${v.price}`,
      submenu: [
        {
          title: 'Cash',
          callbackURL: 'misc:rentals:rent',
          data: {
            model: v.model,
            id,
            pay: 'cash',
          },
        },
        {
          title: 'Bank',
          callbackURL: 'misc:rentals:rent',
          data: {
            model: v.model,
            id,
            pay: 'bank',
          },
        },
      ],
    }))
  );
};

export const rentVehicle = async (src: number, model: string, locId: string, payMethod: 'cash' | 'bank') => {
  const location = config.locations.find(l => l.id === locId);
  const plyName = Util.getName(src);
  if (!location) {
    rentalLogger.warn(`${plyName}(${src}) tried to rent from a non-existing location`, {
      id: locId,
    });
    Notifications.add(src, 'Je kan hier niks huren!?', 'error');
    return;
  }
  const vehRentInfo = config.vehicles.find(v => v.model === model);
  if (!vehRentInfo) {
    rentalLogger.warn(`${plyName}(${src}) tried to rent a non rentable vehicle`, {
      model,
    });
    Admin.ACBan(src, `Voertuigen huren die niet huurbaar zijn`, {
      model,
      location: locId,
    });
    return;
  }
  const vehName = Vehicles.getConfigByModel(vehRentInfo.model)?.name ?? vehRentInfo.model;
  const { taxPrice } = Financials.getTaxedPrice(vehRentInfo.price, 6);

  const spawnLoc = getSpawnLocation(locId);
  if (!spawnLoc) {
    Notifications.add(src, 'Er is geen plaats voor je voertuig', 'error');
    return;
  }

  if (payMethod === 'bank') {
    const payed = await Phone.notificationRequest(src, {
      id: `rent-request-${locId}-${model}`,
      title: `Huur ${vehName}`,
      description: `Prijs: €${taxPrice}`,
      icon: {
        name: 'clipboard',
        color: 'white',
        background: 'black',
      },
    });
    if (!payed) return;
    const plyCid = Util.getCID(src);
    if (!plyCid) {
      return;
    }
    const plyAccId = Financials.getDefaultAccountId(plyCid);
    if (!plyAccId) {
      Notifications.add(src, 'Je hebt geen bankaccount??', 'error');
      rentalLogger.warn(`${Util.getName(src)}(${src}|${plyCid}) doesn't have a standard bankaccount`);
      return;
    }
    const success = await Financials.purchase(plyAccId, plyCid, vehRentInfo.price, `Verhuur: ${vehName}`, 6);
    if (!success) {
      Phone.showNotification(src, {
        id: `rent-request-${locId}-${model}-fail`,
        title: `Bankoverschrijving mislukt`,
        description: `To poor?`,
        icon: {
          name: 'clipboard',
          color: 'white',
          background: 'black',
        },
      });
      return;
    }
  } else {
    const success = Financials.removeCash(src, taxPrice, `vehicle-rent-${model}`);
    if (!success) {
      Notifications.add(src, `Niet genoeg cash op zak?`, 'error');
      return;
    }
  }

  const rentVeh = await Vehicles.spawnVehicle(model, spawnLoc);
  if (!rentVeh) {
    Notifications.add(src, 'Kon voertuig niet uithalen', 'error');
    Financials.addCash(src, taxPrice, 'rent-payback-veh-no-spawn');
    return;
  }
  await Util.Delay(500);
  console.log(rentVeh, NetworkGetNetworkIdFromEntity(rentVeh));
  const vehVin = Vehicles.getVinForVeh(rentVeh);
  const vehPlate = GetVehicleNumberPlateText(rentVeh);
  Inventory.addItemToPlayer(src, 'rent_papers', 1, {
    plate: vehPlate,
    vin: vehVin,
    hiddenKeys: ['vin'],
  });
  Util.Log(
    'rentals:rent',
    {
      plate: vehPlate,
      vin: vehVin,
      payed: taxPrice,
    },
    `${Util.getName(src)} rented a ${model}`,
    src
  );
};
