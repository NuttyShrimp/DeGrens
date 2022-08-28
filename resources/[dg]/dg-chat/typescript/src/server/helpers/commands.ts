import { Admin, Events, Notifications, Util } from '@dgx/server';

import commandManager from '../classes/commandManager';

import { sendMessage } from './messages';

const baseCommands: Server.Command[] = [
  {
    name: 'ooc',
    description: 'Lokaal OOC bericht',
    parameters: [
      {
        name: 'message',
        required: true,
      },
    ],
    permissionLevel: 'user',
    handler: (src, _, args) => {
      const senderCoords = Util.ArrayToVector3(GetEntityCoords(GetPlayerPed(String(src))));
      const plyObj = DGCore.Functions.GetPlayer(src);
      const msg: Shared.Message = {
        prefix: `OOC (${plyObj.PlayerData.charinfo.firstname} ${plyObj.PlayerData.charinfo.lastname}|${src}): `,
        message: args.join(' '),
      };
      DGCore.Functions.GetPlayers().forEach(player => {
        let shouldShow = Admin.hasPermission(player, 'staff') && DGCore.Functions.IsOptin(player);
        if (!shouldShow) {
          // Some more expensive shit so we hide it behind an extra check
          const plyCoords = Util.ArrayToVector3(GetEntityCoords(GetPlayerPed(String(player))));
          shouldShow = senderCoords.subtract(plyCoords).Length <= 20;
        }
        if (!shouldShow) return;
        sendMessage(src, msg);
      });
    },
  },
  {
    name: 'clear',
    description: 'clear je eigen chat',
    parameters: [],
    permissionLevel: 'user',
    handler: src => {
      Events.emitNet('chat:clear', src);
    },
  },
  {
    name: 'chat:restart',
    description: 'herstart je chat',
    parameters: [],
    handler: src => {
      Events.emitNet('chat:restart', src);
    },
  },
];

setImmediate(() => {
  baseCommands.forEach(({ name, description, parameters, permissionLevel, handler }) => {
    commandManager.registerCommand(name, description, parameters, permissionLevel, handler);
  });
});

export const handleCommandExecution = (source: number, cmd: string, args: string[]) => {
  const cmdInfo = commandManager.getCommandInfo(cmd);
  if (!cmdInfo && source > 0) {
    Events.emitNet('executeLocalCmd', source, [cmd, args].join(' '));
    return;
  }
  if (source > 0 && !Admin.hasPermission(source, cmdInfo.permissionLevel)) return;
  const amountReqParams = cmdInfo.parameters.filter(param => param.required ?? true).length;
  if (amountReqParams > args.length) {
    Notifications.add(source, 'Niet alle parameters waren ingevuld!', 'error');
    return;
  }
  cmdInfo.handler(source, cmd, args);
};
