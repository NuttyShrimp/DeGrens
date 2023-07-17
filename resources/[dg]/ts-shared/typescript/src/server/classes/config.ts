import { Util } from './index';

class Config {
  getModuleConfig<T = any>(moduleId: string): T {
    return global.exports['dg-config'].getModuleConfig(moduleId);
  }
  async awaitConfigLoad(): Promise<void> {
    await Util.awaitCondition(() => this.areConfigsReady(), 60000);
  }
  areConfigsReady(): boolean {
    return (
      GetResourceState('dg-config') === 'started' &&
      !!global?.exports?.['dg-config'] &&
      global.exports['dg-config'].areConfigsReady()
    );
  }
  /**
   * @param pathToValue path to the value splitted by '.'
   */
  getConfigValue<T = any>(pathToValue: string): T {
    return global.exports['dg-config'].getConfigValue(pathToValue);
  }

  onModuleLoad = <T>(moduleKey: string, cb: (config: T) => void) => {
    on('dg-config:moduleLoaded', (module: string, config: T) => {
      if (module !== moduleKey) return;
      cb(config);
    });
  };
}

export default {
  Config: new Config(),
};
