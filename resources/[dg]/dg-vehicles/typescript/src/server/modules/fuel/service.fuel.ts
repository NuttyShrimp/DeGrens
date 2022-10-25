import { Financials, Notifications, Util } from '@dgx/server';

import { fuelManager } from './classes/fuelManager';

const FUEL_PRICE_PER_LVL = Util.getRndInteger(15, 20) / 10;

export const getFuelPrice = (vin: string): { fuel: number; price: number } => {
  const fuelLevel = 100 - (fuelManager.getFuelLevel(vin) ?? 0);
  const taxPrice = Financials.getTaxedPrice(FUEL_PRICE_PER_LVL * fuelLevel, 7).taxPrice;
  return { fuel: fuelLevel, price: Math.round(taxPrice * 100) / 100 };
};

export const payRefuel = async (src: number, vin: string) => {
  const { price } = getFuelPrice(vin);
  const player = DGCore.Functions.GetPlayer(src);
  if (price === 0) return;

  let isSuccess = false;
  if (Financials.getCash(src) >= price) {
    isSuccess = Financials.removeCash(src, price, `refuel-${vin}`);
  } else {
    const accountId = Financials.getDefaultAccountId(player.PlayerData.citizenid);
    if (accountId !== undefined) {
      isSuccess = await Financials.purchase(accountId, player.PlayerData.citizenid, price, 'Betaald voor benzine', 7);
    }
  }
  Notifications.add(
    src,
    isSuccess ? 'Succesvol getankt!' : 'Te weinig geld om te betalen voor de benzine',
    isSuccess ? 'success' : 'error'
  );
  if (!isSuccess) {
    return;
  }
  fuelManager.setFuelLevel(vin, 100);
  Util.Log(
    'vehicles:refuel',
    {
      vin,
      price,
    },
    `${player.PlayerData.name}(${player.PlayerData.citizenid}) refueled car with VIN ${vin}`,
    src
  );
};
