import { getPoliceConfig } from './config';

global.exports('getRequirementForActivity', (activity: string) => {
  const requirements = getPoliceConfig().requirements;
  if (!(activity in requirements)) {
    throw new Error(`${activity} is not a known activity`);
  }

  return requirements[activity];
});
