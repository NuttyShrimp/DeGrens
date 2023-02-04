import { Sync, Jobs } from '@dgx/server';
import { getPoliceConfig } from './config';

global.exports('canDoActivity', (activity: string) => {
  const requirements = getPoliceConfig().requirements;
  if (!(activity in requirements)) {
    throw new Error(`${activity} is not a known activity`);
  }

  const requiment = requirements[activity];

  if (requiment.players) {
    const amountOfPlayers = Sync.getAmountOfPlayers();
    if (requiment.players > amountOfPlayers) return false;
  }

  if (requiment.police) {
    const amountOfCops = Jobs.getAmountForJob('police');
    if (requiment.police > amountOfCops) return false;
  }

  return true;
});
