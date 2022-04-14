import { Util } from '@dgx/server';
import commandManager from 'classes/commandManager';

const specialTarget: { [k: string]: (PlayerData: PlayerData) => boolean } = {
  police: data => data.job.name === 'police' && data.job.onduty,
  ambulance: data => data.job.name === 'ambulance' && data.job.onduty,
  admin: data => DGCore.Functions.HasPermission(data.source, 'admin'),
};

export const sendMessage = (target: number | keyof typeof specialTarget, data: Shared.Message) => {
  if (typeof target === 'string') {
    Object.values(DGCore.Functions.GetQBPlayers).forEach((plyObj: Player) => {
      if (!specialTarget?.[target]?.(plyObj.PlayerData)) return;
      emitNet('chat:addNuiMessage', plyObj.PlayerData.source, data);
    });
    return;
  }
  emitNet('chat:addNuiMessage', target, data);
};

onNet('chat:incomingMessage', (msg: string) => {
  emit('chatMessage', source, GetPlayerName(String(source)), msg);
  msg = msg.replace(/^\//, '');
  const args = msg.split(' ');
  const cmd = args.shift();
  emitNet('executeLocalCmd', source, msg);
  const cmdInfo = commandManager.getCommandInfo(cmd);
  if (!cmdInfo) return;
  const amountReqParams = cmdInfo.parameters.filter(param => param.required ?? true).length;
  if (amountReqParams > args.length) {
    Util.Notify(source, 'Niet alle parameters waren ingevuld!', 'error');
    return;
  }
  cmdInfo.handler(source, cmd, args);
});

global.exports('addMessage', sendMessage);
