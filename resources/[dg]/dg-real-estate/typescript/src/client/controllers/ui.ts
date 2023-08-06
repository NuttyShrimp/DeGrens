import { Interiors, RPC, UI, Util } from '@dgx/client';
import { getAccessibleHouses, getBuyableHouse, getHouseInfo } from 'modules/houses/services/store';
import { getZoneForProperty } from 'modules/houses/services/zones';

UI.RegisterUICallback('phone/realestate/get', (_, cb) => {
  const houses = getAccessibleHouses();
  cb({ data: houses, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/nearBuyableHouse', async (_, cb) => {
  const buyableHouse = (await getBuyableHouse()) ?? null;
  cb({ data: buyableHouse, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/toggleLock', async (data: { name: string }, cb) => {
  const toggleState = await RPC.execute('realestate:property:toggleLock', data.name);
  cb({ data: toggleState, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/removeKey', async (data: { name: string; cid: number }, cb) => {
  const success = (await RPC.execute('realestate:property:removeKey', data.name, data.cid)) ?? false;
  cb({ data: success, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/selfRemoveKey', async (data: { name: string }, cb) => {
  const success = (await RPC.execute('realestate:property:removeKey', data.name, LocalPlayer.state.citizenid)) ?? false;
  cb({ data: success, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/transferOwnership', async (data: { name: string; cid: number }, cb) => {
  const success = (await RPC.execute('realestate:property:transferOwnership', data.name, data.cid)) ?? false;
  cb({ data: success, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/giveKey', async (data: { name: string; cid: number }, cb) => {
  const success = (await RPC.execute('realestate:property:addKey', data.name, data.cid)) ?? false;
  cb({ data: success, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/setLocation', async (data: { name: string; location: string }, cb) => {
  if (!Interiors.isInBuilding()) {
    cb({ data: false, meta: { ok: true, message: 'done' } });
    return;
  }
  const loc: Vec3 = global.exports['dg-build'].currentBuildingVector();
  const coords = { ...Util.getPlyCoords().subtract(loc), w: GetEntityHeading(PlayerPedId()) };

  const success = (await RPC.execute('realestate:property:setLocation', data.name, data.location, coords)) ?? false;
  cb({ data: success, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/buyProperty', async (data: { name: string }, cb) => {
  const house = getHouseInfo(data.name);
  if (!house) return;
  const zone = getZoneForProperty(data.name);
  if (!zone) return;
  const success = await RPC.execute<string | boolean>('realestate:property:tryBuy', data.name, zone);
  cb({ data: success ?? false, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/realestate/setGarageLocation', async (data: { name: string }, cb) => {
  if (Interiors.isInBuilding()) {
    cb({ data: 'Garage moet buiten zijn', meta: { ok: true, message: 'done' } });
    return;
  }
  const coords = { ...Util.getPlyCoords(), w: GetEntityHeading(PlayerPedId()) };

  // Check if distance is less than 30
  const house = getHouseInfo(data.name);
  if (!house) {
    cb({ data: false, meta: { ok: true, message: 'done' } });
    return;
  }
  const distance = house.enter.distance(coords);
  if (distance > 30) {
    cb({ data: 'Garage moet binnen 30 meter van de voordeur zijn', meta: { ok: true, message: 'done' } });
    return;
  }

  const success = await RPC.execute('realestate:property:setGarage', data.name, coords);
  cb({ data: success, meta: { ok: true, message: 'done' } });
});
