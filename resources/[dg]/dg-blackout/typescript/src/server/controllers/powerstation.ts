import { RPC } from '@dgx/server';
import powerstationManager from '../classes/PowerstationManager';
import { clientConfig as config } from '../../config';

DGCore.Functions.CreateUseableItem('big_explosive', async (source: number, item: Item) => {
  const Player = DGCore.Functions.GetPlayer(source);
  if (!Player.Functions.GetItemByName(item.name)) return;
  emitNet('dg-blackout:client:UseExplosive', source);
});

setImmediate(() => {
  const amountOfStations = config.powerstations.length;
  powerstationManager.setupStations(amountOfStations);
});

RPC.register('dg-blackout:server:IsStationHit', (_source: number, stationId: number) => {
  return powerstationManager.isStationHit(stationId);
});

onNet('dg-blackout:server:SetStationHit', (stationId: number) => {
  powerstationManager.setStationHit(stationId);
})
