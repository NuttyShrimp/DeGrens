import { Chat, Util } from '@dgx/server';

import { getPlayerRole, hasRoleAccess } from '../permissions/service.permissions';

export const commands: CommandData[] = [];

const generateCaller = (source: number): UserData => {
  return {
    source,
    name: GetPlayerName(String(source)),
    cid: Player(source).state.cid ?? 0,
    steamId: Player(source).state.steamId,
  };
};

const getCommandHandler = (src: number, cmd: string) => {
  const command = commands.find(c => c.name === cmd);
  if (!command) return;
  if (!command.handler) return;
  const caller = generateCaller(src);
  Util.Log(
    `admin:command:${command.name}`,
    {
      command: cmd,
    },
    `${caller.name} executed following admin command ${command.name}`,
    src
  );
  command.handler(caller);
};

export const loadCommands = () => {
  const importAll = (r: __WebpackModuleApi.RequireContext) => {
    r.keys().forEach(key => {
      const newCommands: Record<string, CommandData> = r(key);
      Object.values(newCommands).forEach(command => commands.push(command));
    });
  };
  importAll(require.context('./data', false, /\.ts$/));
  commands
    .filter(c => c.isClientCommand)
    .forEach(c => {
      Chat.registerCommand(c.name, 'Admin command', [], c.role, (src, cmd) => {
        getCommandHandler(src, cmd);
      });
    });
};

export const getUICommands = (src: number): CommandData[] => {
  const plyRole = getPlayerRole(src);
  return commands.filter(c => c.UI && Object.keys(c.UI).length > 1 && hasRoleAccess(plyRole, c.role));
};
