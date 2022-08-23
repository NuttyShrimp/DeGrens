import { Events, Keys, Storage } from '@dgx/client';

import { isDevModeEnabled } from './devmode';

const bindNames: Binds.bindNames[] = ['bind-1', 'bind-2', 'bind-3'];

export const assignBind = (bind: Binds.bindNames, cmd: string) => {
  Storage.setValue(`admin:binds:${bind}`, cmd);
};

export const getAllBinds = (): Record<Binds.bindNames, string | null> => {
  const binds: Record<Binds.bindNames, string | null> = {
    'bind-1': null,
    'bind-2': null,
    'bind-3': null,
  };
  for (const bind of bindNames) {
    binds[bind] = Storage.getValue(`admin:binds:${bind}`);
  }
  return binds;
};

export const runBind = (bind: Binds.bindNames) => {
  if (!isDevModeEnabled()) return;
  const cmdName = Storage.getValue(`admin:binds:${bind}`);
  if (!cmdName) return;
  Events.emitNet('admin:bind:run', cmdName);
};

Keys.register('admin-bind-1', '(zAdmin) Bind 1');
Keys.register('admin-bind-2', '(zAdmin) Bind 2');
Keys.register('admin-bind-3', '(zAdmin) Bind 3');

Keys.onPressDown('admin-bind-1', () => {
  runBind('bind-1');
});

Keys.onPressDown('admin-bind-2', () => {
  runBind('bind-2');
});

Keys.onPressDown('admin-bind-3', () => {
  runBind('bind-3');
});
