import { Financials, Notifications, Util, UI, TaxIds, Taskbar, Inventory } from '@dgx/server';
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
  const fuelLevel = 100 - fuelManager.getFuelLevel(vehicle);
  const taxPrice = Financials.getTaxedPrice(FUEL_PRICE_PER_LVL * fuelLevel, TaxIds.Gas).taxPrice;
  const price = Math.round(taxPrice * 100) / 100;
  return { price, fuel: fuelLevel };
};

export const doRefuel = async (plyId: number, netId: number, usingJerryCan: boolean) => {
  const vehicle = NetworkGetEntityFromNetworkId(netId);
  const vin = getVinForVeh(vehicle);
  if (!vin || !DoesEntityExist(vehicle)) return;

  const { price, fuel: missingFuel } = getFuelPrice(vehicle);
  if (price === 0) {
    Notifications.add(plyId, 'Voertuig is al getankt', 'error');
    return;
  }

  const cid = Util.getCID(plyId);
  const accountId = Financials.getDefaultAccountId(cid);
  if (!accountId) return;

  if (!usingJerryCan) {
    const balance = Financials.getAccountBalance(accountId) ?? 0;
    if (Math.max(balance, Financials.getCash(plyId)) < price) {
      Notifications.add(plyId, 'Je hebt niet genoeg geld!', 'error');
      return;
    }
  }

  const [_, taskbarCancelPercentage] = await Taskbar.create(
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

  const percentageFilled = taskbarCancelPercentage / 100;
  const newFuelLevel = 100 - missingFuel + missingFuel * percentageFilled;
  const priceForPercentage = price * percentageFilled;

  let isSuccess = false;

  if (usingJerryCan) {
    const jerrycanItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'weapon_petrolcan');
    if (jerrycanItem) {
      isSuccess = true;
      Inventory.setQualityOfItem(jerrycanItem.id, old => old - 10);
    }
  } else {
    if (Financials.getCash(plyId) >= priceForPercentage) {
      isSuccess = Financials.removeCash(plyId, priceForPercentage, `refuel-${vin}`);
    } else {
      isSuccess = await Financials.purchase(accountId, cid, priceForPercentage, 'Betaald voor benzine', TaxIds.Gas);
    }
  }

  Notifications.add(
    plyId,
    isSuccess
      ? 'Succesvol getankt!'
      : usingJerryCan
      ? 'Je hebt geen jerrycan'
      : 'Te weinig geld om te betalen voor de benzine',
    isSuccess ? 'success' : 'error'
  );
  if (!isSuccess) return;

  fuelManager.setFuelLevel(vehicle, newFuelLevel);

  Util.Log(
    'vehicles:refuel',
    {
      vin,
      price: priceForPercentage,
      newFuelLevel,
    },
    `${Util.getName(plyId)}(${plyId}) refueled car with VIN ${vin}`,
    plyId
  );
};
