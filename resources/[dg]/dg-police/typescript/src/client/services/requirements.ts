import { Jobs, Sync } from '@dgx/client';

let requirements: Police.Config['requirements'];

export const setRequirements = (config: typeof requirements) => {
  requirements = config;
};

global.exports('canDoActivity', (activity: string) => {
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
