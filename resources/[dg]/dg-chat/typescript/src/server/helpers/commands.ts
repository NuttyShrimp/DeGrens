import { Admin, Core, Events, Notifications, Util } from '@dgx/server';

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
      const plyObj = Core.getPlayer(src);
      const msg: Shared.Message = {
        prefix: `OOC (${plyObj.charinfo.firstname} ${plyObj.charinfo.lastname} | ${src}): `,
        message: args.join(' '),
      };
      Util.Log(
        'chat:ooc:local',
        {
          msg,
        },
        `${Util.getName(src)} heeft een lokaal OOC bericht verstuurd`,
        src
      );
      Util.getAllPlayers().forEach(player => {
        let shouldShow = Admin.hasPermission(player, 'support') && Admin.isInDevMode(player);
        if (!shouldShow) {
          // Some more expensive shit so we hide it behind an extra check
          const plyCoords = Util.ArrayToVector3(GetEntityCoords(GetPlayerPed(String(player))));
          shouldShow = senderCoords.subtract(plyCoords).Length <= 30;
        }
        if (!shouldShow) return;
        sendMessage(player, msg);
      });
    },
  },
  {
    name: 'oocg',
    description: 'Globaal OOC bericht',
    parameters: [
      {
        name: 'message',
        required: true,
      },
    ],
    permissionLevel: 'user',
    handler: (src, _, args) => {
      const plyObj = Core.getPlayer(src);
      const msg: Shared.Message = {
        prefix: `OOCG (${plyObj.charinfo.firstname} ${plyObj.charinfo.lastname} | ${src}): `,
        message: args.join(' '),
      };
      Util.Log(
        'chat:ooc:global',
        {
          msg,
        },
        `${Util.getName(src)} heeft een globaal OOC bericht verstuurd`,
        src
      );
      Util.getAllPlayers().forEach(player => {
        sendMessage(player, msg);
      });
    },
  },
  {
    name: 'me',
    description: 'Toon bericht om RP te stimuleren met tekst',
    parameters: [
      {
        name: 'message',
        required: true,
      },
    ],
    permissionLevel: 'user',
    handler: (src, _, args) => {
      const senderCoords = Util.ArrayToVector3(GetEntityCoords(GetPlayerPed(String(src))));
      const msg = args.join(' ');
      Util.Log(
        'chat:me',
        {
          msg,
        },
        `${Util.getName(src)} heeft een /me bericht verstuurd`,
        src
      );
      Util.getAllPlayers().forEach(player => {
        const plyCoords = Util.ArrayToVector3(GetEntityCoords(GetPlayerPed(String(player))));
        const shouldShow = senderCoords.subtract(plyCoords).Length <= 25;
        if (!shouldShow) return;
        Events.emitNet('dg-misc:me:show', player, src, msg);
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
    permissionLevel: 'user',
    handler: src => {
      Events.emitNet('chat:restart', src);
    },
  },
  {
    name: 'id',
    description: 'Bezie je Server-ID',
    parameters: [],
    permissionLevel: 'user',
    handler: src => {
      sendMessage(src, {
        message: String(src),
        prefix: 'ID: ',
        type: 'system',
      });
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
    if (source > 0) {
      Events.emitNet('executeLocalCmd', source, [cmd, args].join(' '));
    }
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
