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
  setHealth(data.metadata.health / 2);
  const ped = PlayerPedId();
  SetPedArmour(ped, data.metadata.armor);
});

global.exports('setHealth', setHealth);
