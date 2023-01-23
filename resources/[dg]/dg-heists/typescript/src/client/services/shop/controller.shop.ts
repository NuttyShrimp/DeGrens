import { Events, Keys, Notifications, Peek, PolyZone, RPC, UI } from '@dgx/client';

let inPickupZone = false;
let pickupBlip: number;
let pickupCoords: Vec3;

Events.emitNet('heists:shop:loadLaptopPickup', (coords: Vec3) => {
  pickupCoords = coords;
  PolyZone.addCircleZone('heists_laptop_pickup', coords, 1.5, { data: {} }, true);
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

Events.onNet('heists:shop:restorePickup', () => {
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
