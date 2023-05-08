import { Admin, Core, Events, Jobs, Util } from '@dgx/server';

import { handleCommandExecution } from './commands';

const specialTarget: { [k: string]: (PlayerData: Core.Characters.Player) => boolean } = {
  police: data => !!data.serverId && Jobs.getCurrentJob(data.serverId) === 'police',
  ambulance: data => !!data.serverId && Jobs.getCurrentJob(data.serverId) === 'ambulance',
  admin: data => !!data.serverId && Admin.hasPermission(data.serverId, 'support') && Admin.isInDevMode(data.serverId),
};

let charModule: Core.ServerModules.CharacterModule;

setImmediate(() => {
  charModule = Core.getModule('characters');
});

export const sendMessage = (target: number | keyof typeof specialTarget, data: Shared.Message) => {
  if (typeof target === 'string') {
    Object.values(charModule.getAllPlayers()).forEach(plyObj => {
      if (!specialTarget[target]?.(plyObj) || !plyObj.serverId) return;
      Events.emitNet('chat:addNuiMessage', plyObj.serverId, data);
    });
    return;
  }
  Events.emitNet('chat:addNuiMessage', target, data);
};

Events.onNet('chat:incomingMessage', (source: number, msg: string) => {
  emit('chatMessage', source, GetPlayerName(String(source)), msg);
  msg = msg.replace(/^\//, '');
  const args = msg.split(' ');
  const cmd = args.shift()!;
  Util.Log(
    'chat:message',
    {
      command: cmd,
      args,
    },
    `${GetPlayerName(String(source))} tried to execute command ${cmd}`,
    source
  );
  handleCommandExecution(source, cmd, args);
});

global.exports('sendMessage', sendMessage);
