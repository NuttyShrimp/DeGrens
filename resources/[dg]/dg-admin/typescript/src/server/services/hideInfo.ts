import { Events, RPC } from '@dgx/server';

let hiddenPlys: number[] = [];

global.exports('getHiddenPlys', () => hiddenPlys);

export const hidePly = (ply: number, toggle: boolean) => {
  if (toggle) {
    hiddenPlys.push(ply);
  } else {
    hiddenPlys = hiddenPlys.filter(id => id !== ply);
  }
};

Events.onNet('admin:hideinfo:toggle', hidePly);
