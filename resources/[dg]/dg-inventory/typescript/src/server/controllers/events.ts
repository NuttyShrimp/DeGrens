import { Events } from '@dgx/server';

onNet('hospital:server:SetLaststandStatus', (isLastStand: boolean) => {
  if (isLastStand === false) return;
  Events.emitNet('inventory:client:closeInventory', source);
});

onNet('hospital:server:SetDeathStatus', (isDead: boolean) => {
  if (isDead === false) return;
  Events.emitNet('inventory:client:closeInventory', source);
});
