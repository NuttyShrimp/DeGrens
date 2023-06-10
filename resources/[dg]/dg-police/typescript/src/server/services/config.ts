import { Config, Util } from '@dgx/server';
import { setPoliceVehicles } from '@shared/services/vehicles';

let policeConfig: Police.Config | null = null;

export const awaitPoliceConfigLoad = () => Util.awaitCondition(() => policeConfig !== null);

export const getPoliceConfig = () => {
  if (policeConfig === null) {
    throw new Error('Tried to get config but was not initialized yet...');
  }
  return policeConfig;
};

export const loadPoliceConfig = async () => {
  await Config.awaitConfigLoad();
  policeConfig = Config.getConfigValue<Police.Config>('police');

  // Set all req to 0 if devenv
  if (Util.isDevEnv()) {
    for (const activity of Object.keys(policeConfig.requirements)) {
      for (const requirementKey of Object.keys(policeConfig.requirements[activity]) as (keyof Police.Requirement)[]) {
        policeConfig.requirements[activity][requirementKey] = 0;
      }
    }
  }

  setPoliceVehicles(policeConfig.vehicles);
};
