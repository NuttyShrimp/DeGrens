import { Events, Keys, PolyZone, UI } from '@dgx/client';

import shopManager from './classes/ShopManager';

Events.onNet('vehicles:shop:buildZone', (shopZone: VehicleShop.Config['shopZone']) => {
  PolyZone.addPolyZone(
    'pdm_shop',
    shopZone.vectors,
    {
      data: {},
      minZ: shopZone.minZ,
      maxZ: shopZone.maxZ,
    },
    true
  );
  const vectorsSum = shopZone.vectors.reduce((prev, cur) => ({ x: prev.x + cur.x, y: prev.y + cur.y }));
  const vectorsAverage = { x: vectorsSum.x / shopZone.vectors.length, y: vectorsSum.y / shopZone.vectors.length, z: 0 };
  DGCore.Blips.Add('vehicleshop', {
    id: `vehicleshop-pdm`,
    text: 'PDM',
    coords: vectorsAverage,
    sprite: 326,
    color: 2,
    scale: 0.9,
  });
  console.log(`[VehicleShop] Shopzone has been built`);
});

PolyZone.onEnter('pdm_shop', shopManager.enteredShop);
PolyZone.onLeave('pdm_shop', shopManager.leftShop);

PolyZone.onEnter<{ id: number }>('pdm_spot', (_, data) => {
  shopManager.enteredSpot(data.id);
});
PolyZone.onLeave<{ id: number }>('pdm_spot', (_, data) => {
  shopManager.leftSpot(data.id);
});

// Select vehicle model
Keys.onPressDown('GeneralUse', async () => {
  if (!shopManager.inShop || shopManager.activeSpot === null) return;
  Events.emitNet('vehicles:shop:openVehicleMenu', 'brand');
});

UI.RegisterUICallback('vehicleshop/changeCategorisation', (data: { cat: string }, cb) => {
  Events.emitNet('vehicles:shop:openVehicleMenu', data.cat);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('vehicleshop/selectModel', (data: { model: string }, cb) => {
  const activeSpot = shopManager.activeSpot;
  if (activeSpot === null) return;
  if (shopManager.getSpot(activeSpot)?.model === data.model) return;
  Events.emitNet('vehicles:shop:changeModel', activeSpot, data.model);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

Events.onNet('vehicles:shop:changeModel', (spotId: number, model: string, needsEmployee: boolean) => {
  const spot = shopManager.getSpot(spotId);
  if (!spot) return;
  spot.changeModel(model, needsEmployee);
});
