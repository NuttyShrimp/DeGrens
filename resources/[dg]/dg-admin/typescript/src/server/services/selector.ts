import { Events, RPC, Util } from '@dgx/server';

import { getUserData } from '../helpers/identifiers';
import { commands } from '../modules/commands/service.commands';
import { ACBan } from '../modules/penalties/service.penalties';
import { getPlayerRole, hasPlayerPermission, hasRoleAccess } from '../modules/permissions/service.permissions';
import { mainLogger } from '../sv_logger';

const getSelectorCommands = (src: number) => {
  const plyRole = getPlayerRole(src);
  // Array of arrays of actions. (index is entity type)
  const actions: CommandData[][] = [];
  commands
    .filter(c => c.target && c.target.length > 0)
    .filter(c => hasRoleAccess(plyRole, c.role))
    .forEach(c => {
      if (!c.target || c.target.length < 1) return;
      c.target.forEach(t => {
        if (!actions[t]) actions[t] = [];
        actions[t].push(c);
      });
    });
  return actions;
};

Events.onNet('admin:selector:action', (src, data: { name: string; netId: number; entityType: number }) => {
  if (!data?.name) return;
  let entity = NetworkGetEntityFromNetworkId(data.netId);
  if (entity && !DoesEntityExist(entity)) return;
  entity = entity || data.netId;
  const cmd = getSelectorCommands(src)[data.entityType]?.find(a => a.name === data.name);
  if (!cmd) {
    Util.Log(
      'admin:menu:action:error',
      {
        cmdData: data,
      },
      `${GetPlayerName(String(src))} tried to execute an unknown admin command (${data.name}) via selector`,
      src
    );
    mainLogger.error(
      `${GetPlayerName(String(src))} tried to execute an unknown admin command (${data.name}) via selector`
    );
    return;
  }
  if (!hasPlayerPermission(src, cmd.role)) {
    ACBan(src, 'Event injection: toggle dev mode');
    return;
  }
  Util.Log(
    'admin:selector:action',
    {
      cmdData: data,
    },
    `${GetPlayerName(String(src))} ${cmd.log} (${cmd.name})`,
    src
  );
  if (cmd.isClientCommand) {
    Events.emitNet('admin:commands:runCmd', src, cmd.handler.toString(), [
      getUserData(src),
      {
        entity: data.netId,
      },
    ]);
    return;
  }
  cmd.handler(getUserData(src), {
    entity,
  });
});

RPC.register('admin:selector:getActions', src =>
  getSelectorCommands(src).map(a => a.map(c => ({ name: c.name, title: c.UI?.title ?? c.name + ' (bad configured)' })))
);
