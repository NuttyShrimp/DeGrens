import { Events, Notifications, Util } from '@dgx/server';

import commandManager from '../classes/commandManager';

import { sendMessage } from './messages';

// TODO: admin related shit to admin menu when rewritten
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
        let shouldShow = DGCore.Functions.HasPermission(player, 'admin') && DGCore.Functions.IsOptin(player);
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
    name: 'clearAll',
    description: "clear everyone's chat",
    parameters: [],
    permissionLevel: 'admin',
    handler: src => {
      if (!DGCore.Functions.HasPermission(src, 'admin')) {
        // TODO: ban for injection
        return;
      }
      Events.emitNet('chat:clear', -1);
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
  if (!cmdInfo) {
    Events.emitNet('executeLocalCmd', source, [cmd, args].join(' '));
    return;
  }
  if (!DGCore.Functions.HasPermission(source, cmdInfo.permissionLevel)) return;
  const amountReqParams = cmdInfo.parameters.filter(param => param.required ?? true).length;
  if (amountReqParams > args.length) {
    Notifications.add(source, 'Niet alle parameters waren ingevuld!', 'error');
    return;
  }
  cmdInfo.handler(source, cmd, args);
};
