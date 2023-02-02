import { Util } from '@dgx/server';
import { getPoliceConfig } from './config';

global.exports('getRequirementForActivity', (activity: string) => {
  const requirements = getPoliceConfig().requirements;
  if (!(activity in requirements)) {
    throw new Error(`${activity} is not a known activity`);
  }

  if (Util.isDevEnv()) {
    for (const activity of Object.keys(requirements)) {
      requirements[activity] = 0;
    }
  }

  return requirements[activity];
});
