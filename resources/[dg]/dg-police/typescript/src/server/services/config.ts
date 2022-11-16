import { Config } from '@dgx/server';
import { Util } from '@dgx/shared';

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
  policeConfig = Config.getConfigValue('police');
};
