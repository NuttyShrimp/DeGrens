import { Financials, Notifications, Util, UI, TaxIds, Taskbar } from '@dgx/server';
import { fuelManager } from './classes/fuelManager';
import { getVinForVeh } from 'helpers/vehicle';
import { REFUEL_DURATION_PER_LEVEL } from './constants.fuel';

const FUEL_PRICE_PER_LVL = Util.getRndInteger(7, 10) / 10;

export const openRefuelMenu = (plyId: number, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  if (!vehicle || !DoesEntityExist(vehicle)) return;

  const { price } = getFuelPrice(vehicle);

  UI.openContextMenu(plyId, [
    {
      id: 'vehicles_fuel_price',
      title: 'Tankstation',
      description: `Prijs: €${price} incl. BTW`,
      icon: 'gas-pump',
      callbackURL: 'vehicles:fuel:startRefuel',
      data: {
        netId,
      },
    },
  ]);
};

const getFuelPrice = (vehicle: number) => {
  const fuelLevel = 100 - (fuelManager.getFuelLevel(vehicle) ?? 0);
  const taxPrice = Financials.getTaxedPrice(FUEL_PRICE_PER_LVL * fuelLevel, TaxIds.Gas).taxPrice;
  const price = Math.round(taxPrice * 100) / 100;
  return { price, fuel: fuelLevel };
};

export const doRefuel = async (plyId: number, netId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  const { price, fuel: missingFuel } = getFuelPrice(vehicle);
  const cid = Util.getCID(plyId);

  const accountId = Financials.getDefaultAccountId(cid);
  const balance = !accountId ? 0 : Financials.getAccountBalance(accountId) ?? 0;
  if (Math.max(balance, Financials.getCash(plyId)) < price) {
    Notifications.add(plyId, 'Je hebt niet genoeg geld!', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(
    plyId,
    'gas-pump',
    'Tanken',
    Math.max(missingFuel * REFUEL_DURATION_PER_LEVEL, 5000),
    {
      canCancel: true,
      cancelOnDeath: true,
      controlDisables: {
        movement: true,
        combat: true,
      },
      animation: {
        animDict: 'timetable@gardener@filling_can',
        anim: 'gar_ig_5_filling_can',
        flags: 50,
      },
    }
  );
  if (canceled) return;

  const vin = getVinForVeh(vehicle);
  if (price === 0) return;

  let isSuccess = false;
  if (Financials.getCash(plyId) >= price) {
    isSuccess = Financials.removeCash(plyId, price, `refuel-${vin}`);
  } else {
    if (accountId !== undefined) {
      isSuccess = await Financials.purchase(accountId, cid, price, 'Betaald voor benzine', TaxIds.Gas);
    }
  }
  Notifications.add(
    plyId,
    isSuccess ? 'Succesvol getankt!' : 'Te weinig geld om te betalen voor de benzine',
    isSuccess ? 'success' : 'error'
  );
  if (!isSuccess) return;

  fuelManager.setFuelLevel(vehicle, 100);

  Util.Log(
    'vehicles:refuel',
    {
      vin,
      price,
    },
    `${Util.getName(plyId)}(${plyId}) refueled car with VIN ${vin}`,
    plyId
  );
};
