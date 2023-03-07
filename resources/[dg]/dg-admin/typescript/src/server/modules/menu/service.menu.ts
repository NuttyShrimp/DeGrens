import { Chat, Events, Util } from '@dgx/server';

import { getUICommands } from '../commands/service.commands';
import { ACBan } from '../penalties/service.penalties';
import { hasPlayerPermission } from '../permissions/service.permissions';

const plysInDevMode = new Set<number>();

export const setDevMode = (src: number, toggle: boolean) => {
  // dev env check because devmode will be auto toggled for everyone when in dev env
  if (!Util.isDevEnv() && !hasPlayerPermission(src, 'support')) {
    ACBan(src, 'Event injection: toggle dev mode');
    return;
  }
  if (toggle) {
    plysInDevMode.add(src);
  } else {
    if (!plysInDevMode.has(src)) {
      return;
    }
    plysInDevMode.delete(src);
  }
  Events.emitNet('admin:toggle:devmode', src, toggle);
};

export const checkBinds = async (src: number, binds: Record<Binds.bindNames, string | null>) => {
  const cmds = getUICommands(src);
  for (const bind in binds) {
    const cmd = cmds.find(c => c.name === binds[bind as Binds.bindNames]);
    if (!cmd) {
      binds[bind as Binds.bindNames] = null;
    }
  }
  Events.emitNet('admin:bind:check:response', src, binds);
};

export const announceMessage = (src: number, message: string[] | string) => {
  if (src > 0) {
    Util.Log(
      'admin:announce',
      {
        message,
      },
      `${Util.getName(src)} heeft een announcement gemaakt in de server`,
      src
    );
  }
  if (Array.isArray(message)) {
    message = message.join(' ');
  }
  Chat.sendMessage(-1, {
    prefix: 'Announcement: ',
    message,
    type: 'error',
  });
};

export const isInDevMode = (src: number) => plysInDevMode.has(src);
export const getDevModeSet = () => [...plysInDevMode];
