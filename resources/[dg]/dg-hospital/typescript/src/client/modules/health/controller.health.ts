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
