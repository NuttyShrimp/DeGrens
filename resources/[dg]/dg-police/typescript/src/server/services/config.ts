import { Config, Util } from '@dgx/server';

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

  if (Util.isDevEnv()) {
    for (const activity of Object.keys(policeConfig.requirements)) {
      policeConfig.requirements[activity] = 0;
    }
  }
};
