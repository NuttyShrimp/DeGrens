import { Events, PolyZone, RPC } from '@dgx/client';

let storeItems: Laptop.Bennys.Item[];
let lastFetch: Date;
let pickupBlip: number;

export const getStoreItems = async () => {
  if (!lastFetch || new Date().getTime() / 1000 - lastFetch.getTime() / 1000 > 60 * 60) {
    storeItems = (await RPC.execute<Laptop.Bennys.Item[]>('vehicles:laptop:benny:getItems')) ?? [];
  }
  return storeItems;
};

export const createPickupBlip = (loc: Laptop.Bennys.PickUp) => {
  if (pickupBlip && DoesBlipExist(pickupBlip)) RemoveBlip(pickupBlip);
  pickupBlip = AddBlipForCoord(loc.coords.x, loc.coords.y, loc.coords.z);
  SetBlipSprite(pickupBlip, 586);
  SetBlipColour(pickupBlip, 5);
  SetBlipDisplay(pickupBlip, 2);
  SetBlipScale(pickupBlip, 0.8);
  SetBlipAsShortRange(pickupBlip, true);
  BeginTextCommandSetBlipName('STRING');
  AddTextComponentString("Benny' pickup");
  EndTextCommandSetBlipName(pickupBlip);
};

export const createPickupZone = (loc: Laptop.Bennys.PickUp) => {
  PolyZone.addBoxZone('bennys-order-pickup', loc.coords, loc.width, loc.length, {
    data: {},
    ...loc.data,
  });
  PolyZone.onEnter('bennys-order-pickup', () => {
    Events.emitNet('vehicles:server:laptop:receiveItems');
    if (DoesBlipExist(pickupBlip)) {
      RemoveBlip(pickupBlip);
    }
  });
};
