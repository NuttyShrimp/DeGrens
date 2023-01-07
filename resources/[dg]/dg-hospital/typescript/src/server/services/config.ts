import { Config, Util } from '@dgx/server';

let hospitalConfig: Hospital.Config | null = null;

export const awaitHospitalConfigLoad = () => Util.awaitCondition(() => hospitalConfig !== null);

export const getHospitalConfig = () => {
  if (hospitalConfig === null) {
    throw new Error('Tried to get config but was not initialized yet...');
  }
  return hospitalConfig;
};

export const loadHospitalConfig = async () => {
  await Config.awaitConfigLoad();
  hospitalConfig = Config.getConfigValue('hospital');
};
