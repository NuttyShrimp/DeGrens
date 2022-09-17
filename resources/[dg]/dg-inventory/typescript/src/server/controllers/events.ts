import { Events } from '@dgx/server';
import { loadConfig } from 'services/config';

onNet('hospital:server:SetLaststandStatus', (isLastStand: boolean) => {
  if (isLastStand === false) return;
  Events.emitNet('inventory:client:closeInventory', source);
});

onNet('hospital:server:SetDeathStatus', (isDead: boolean) => {
  if (isDead === false) return;
  Events.emitNet('inventory:client:closeInventory', source);
});

onNet('police:server:SetHandcuffStatus', (isHandCuffed: boolean) => {
  if (isHandCuffed === false) return;
  Events.emitNet('inventory:client:closeInventory', source);
});

on('dg-config:moduleLoaded', (moduleId: string) => {
  if (moduleId !== 'inventory.config') return;
  loadConfig();
});
