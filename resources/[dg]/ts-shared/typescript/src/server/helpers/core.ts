import { Core } from '../classes/index';

let charModule: Core.ServerModules.CharacterModule;

setImmediate(() => {
  charModule = Core.getModule('characters');
});

export const getPlayer = (src: number) => {
  return charModule.getPlayer(src);
};

export const getOfflinePlayer = (cid: number) => {
  return charModule.getOfflinePlayer(cid);
};
