import { Events } from '@dgx/client';
import { getBleedAmount, getHealth, setBleedAmount, setHealth } from './service.health';

Events.onNet('hospital:health:useHeal', (healthIncrease: number, bleedDecrease: number) => {
  // increase health
  const currentHealth = getHealth();
  setHealth(currentHealth + healthIncrease);

  // lower bleed
  const currentBleed = getBleedAmount();
  setBleedAmount(currentBleed - bleedDecrease);
});

onNet('dg-chars:client:finishSpawn', () => {
  const data = DGCore.Functions.GetPlayerData();
  const health = data.metadata.health - 100;
  setHealth(Math.max(1, Math.min(100, health)));
  // armor gets restored on serverside in services/armor.ts
});

global.exports('setHealth', setHealth);
