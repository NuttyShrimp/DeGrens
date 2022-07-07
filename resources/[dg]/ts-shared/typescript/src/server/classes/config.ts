import { Util } from './index';

class Config {
  getModuleConfig<T = any>(moduleId: string): T {
    return global.exports['dg-config'].getModuleConfig(moduleId);
  }
  async awaitConfigLoad(): Promise<void> {
    while (!this.areConfigsReady()) {
      await Util.Delay(10);
    }
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
