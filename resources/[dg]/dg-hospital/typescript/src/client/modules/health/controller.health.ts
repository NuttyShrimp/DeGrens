import { Events } from '@dgx/client';
import { getBleedAmount, getHealth, setBleedAmount, setHealth, temporarilyPreventBleeding } from './service.health';

Events.onNet('hospital:health:useHealItem', (effect: Hospital.HealItem['effects']) => {
  // Handle health restore effect
  if (effect.healthRestore) {
    const currentHealth = getHealth();
    setHealth(currentHealth + effect.healthRestore);
  }

  // Handle bleeding decrease effect
  if (effect.bleedingDecrease) {
    const currentBleed = getBleedAmount();
    setBleedAmount(currentBleed - effect.bleedingDecrease);
  }

  // Handle preventing bleed effect
  if (effect.preventBleeding) {
    temporarilyPreventBleeding(effect.preventBleeding);
  }
});

onNet('dg-chars:client:finishSpawn', () => {
  const data = DGCore.Functions.GetPlayerData();
  const health = data.metadata.health - 100;
  setHealth(Math.max(1, Math.min(100, health)));
  // armor gets restored on serverside in services/armor.ts
});

global.exports('setHealth', setHealth);
