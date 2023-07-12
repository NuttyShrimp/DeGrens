import { getModule } from 'moduleController';

const charModule = getModule('characters');
global.exports('getPlayer', (src: number) => {
  return charModule.getPlayer(src);
});

global.exports('getModule', getModule);
