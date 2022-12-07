import { Events, Inventory, Keys, Notifications, Peek, PolyZone, RPC, UI } from '@dgx/client';

let inPickupZone = false;
let pickupBlip: number;
let pickupCoords: Vec3;

setImmediate(async () => {
  pickupCoords = await RPC.execute<Vec3>('heists:server:getLaptopPickup');
  PolyZone.addCircleZone('heists_laptop_pickup', pickupCoords, 1.5, { data: {} }, true);
});

Peek.addFlagEntry('isHeistsIllegalShop', {
  options: [
    {
      icon: 'fas fa-laptop',
      label: 'Open Shop',
      action: () => {
        Events.emitNet('heists:server:openIllegalShop');
      },
    },
  ],
  distance: 2.0,
});

onNet('DGCore:client:playerLoaded', async () => {
  const hasActivePickup = await RPC.execute('heists:server:hasActivePickup');
  if (!hasActivePickup) return;
  createLaptopBlip();
});

UI.RegisterUICallback('heists/buyIllegalShopItem', async (data: { drive: Shop.Name }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  const success = await RPC.execute<boolean>('heists:server:buyLaptop', data.drive as Shop.Name);
  if (!success) {
    Notifications.add('Je kan dit momenteel niet kopen', 'error');
    return;
  }
  Notifications.add('De pickup staat gemarkeerd op je GPS', 'success');
  createLaptopBlip();
});

const removePickupBlip = () => {
  if (pickupBlip && DoesBlipExist(pickupBlip)) RemoveBlip(pickupBlip);
};

const createLaptopBlip = async () => {
  removePickupBlip();
  if (!pickupCoords) await RPC.execute<Vec3>('heists:server:getLaptopPickup');
  pickupBlip = AddBlipForCoord(pickupCoords.x, pickupCoords.y, pickupCoords.z);
  SetBlipSprite(pickupBlip, 521);
  SetBlipColour(pickupBlip, 3);
  SetBlipDisplay(pickupBlip, 2);
  SetBlipScale(pickupBlip, 1.0);
};

PolyZone.onEnter('heists_laptop_pickup', () => {
  inPickupZone = true;
});
PolyZone.onLeave('heists_laptop_pickup', () => {
  inPickupZone = false;
});

Keys.onPressDown('GeneralUse', () => {
  if (!inPickupZone) return;
  removePickupBlip();
  Events.emitNet('heists:server:pickupLaptop');
});
