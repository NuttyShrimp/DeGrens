import { Events } from './index';

class Core {
  getModule<T extends keyof Core.ClientModules.List>(name: T): Core.ClientModules.List[T] {
    return global.exports['dg-core'].getModule(name);
  }

  onPlayerLoaded = (handler: (playerData: Core.Characters.Player) => void) => {
    Events.onNet('core:characters:loaded', handler);
  };

  onPlayerUnloaded = (handler: (cid: number) => void) => {
    Events.onNet('core:characters:unloaded', handler);
  };

  onModuleStarted = (moduleName: keyof Core.ClientModules.List, handler: () => void) => {
    on('core:module:started', (mod: keyof Core.ClientModules.List) => {
      if (mod !== moduleName) return;
      handler();
    });
  };
}

export default {
  Core: new Core(),
};
