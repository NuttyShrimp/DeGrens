import { Events, Jobs, Util } from '@dgx/server';
import { handleCommandExecution } from './commands';

const specialTarget: { [k: string]: (PlayerData: PlayerData) => boolean } = {
  police: data => Jobs.getCurrentJob(data.source) === 'police',
  ambulance: data => Jobs.getCurrentJob(data.source) === 'ambulance',
  admin: data => DGCore.Functions.HasPermission(data.source, 'admin'),
};

export const sendMessage = (target: number | keyof typeof specialTarget, data: Shared.Message) => {
  if (typeof target === 'string') {
    Object.values(DGCore.Functions.GetQBPlayers).forEach((plyObj: Player) => {
      if (!specialTarget?.[target]?.(plyObj.PlayerData)) return;
      Events.emitNet('chat:addNuiMessage', plyObj.PlayerData.source, data);
    });
    return;
  }
  Events.emitNet('chat:addNuiMessage', target, data);
};

Events.onNet('chat:incomingMessage', (source: number, msg: string) => {
  emit('chatMessage', source, GetPlayerName(String(source)), msg);
  msg = msg.replace(/^\//, '');
  const args = msg.split(' ');
  const cmd = args.shift();
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
