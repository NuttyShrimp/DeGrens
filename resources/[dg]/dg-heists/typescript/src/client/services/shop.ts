import { Events, Keys, Peek, PolyZone, UI } from '@dgx/client';

let inPickupZone = false;

export const buildShopPickupZone = (zone: Vec4) => {
  const { w: heading, ...coords } = zone;
  PolyZone.addBoxZone('heists_shop_pickup', coords, 1.5, 1.5, {
    heading,
    minZ: coords.z - 2,
    maxZ: coords.z + 3,
    data: {},
  });
};

PolyZone.onEnter('heists_shop_pickup', () => {
  inPickupZone = true;
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Aankloppen`);
});
PolyZone.onLeave('heists_shop_pickup', () => {
  inPickupZone = false;
  UI.hideInteraction();
});

Keys.onPressDown('GeneralUse', () => {
  if (!inPickupZone) return;
  Events.emitNet('heists:shop:pickup');
});

Peek.addFlagEntry('heistShopNPC', {
  options: [
    {
      icon: 'fas fa-laptop',
      label: 'Open Shop',
      action: () => {
        Events.emitNet('heists:shop:open');
      },
    },
  ],
  distance: 2.0,
});

UI.RegisterUICallback('heists/shop/buy', async (data: { itemIdx: number }, cb) => {
  Events.emitNet('heists:shop:buy', data.itemIdx);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
