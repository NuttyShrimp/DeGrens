import { Util } from './index';

class Config {
  getModuleConfig<T = any>(moduleId: string): T {
    return global.exports['dg-config'].getModuleConfig(moduleId);
  }
  async awaitConfigLoad(): Promise<void> {
    await Util.awaitCondition(
      () => GetResourceState('dg-config') === 'started' && !!global?.exports?.['dg-config'] && this.areConfigsReady(),
      60000
    );
  }
  areConfigsReady(): boolean {
    return global.exports['dg-config'].areConfigsReady();
  }
  /**
   * @param pathToValue path to the value splitted by '.'
   */
  getConfigValue<T = any>(pathToValue: string): T {
    return global.exports['dg-config'].getConfigValue(pathToValue);
  }
}

export default {
  Config: new Config(),
};
