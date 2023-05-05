class Core {
  getModule<T extends keyof Core.ServerModules.List>(name: T): Core.ServerModules.List[T] {
    return global.exports['dg-core'].getModule(name);
  }
  getPlayer(src: number): Core.Characters.Player | undefined {
    return global.exports['dg-core'].getPlayer(src);
  }

  onPlayerLoaded = (handler: (playerData: Core.Characters.Player) => void) => {
    on('core:characters:loaded', handler);
  };

  onPlayerUnloaded = (handler: (plyId: number, cid: number, playerData: Core.Characters.Player) => void) => {
    on('core:characters:unloaded', handler);
  };
}

export default {
  Core: new Core(),
};
