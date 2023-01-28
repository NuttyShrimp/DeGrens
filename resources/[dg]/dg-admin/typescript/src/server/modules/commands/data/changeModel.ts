import { Events, Notifications, RPC } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface ChangeModelData {
  Target?: UI.Player;
  model?: string;
}

export const changeModel: CommandData = {
  name: 'changeModel',
  role: 'developer',
  target: false,
  isClientCommand: false,
  log: 'changed his model',
  handler: async (caller, data: ChangeModelData) => {
    if (!data.model || data.model === '') {
      Notifications.add(caller.source, 'Je moet een model meegeven', 'error');
      return;
    }

    const plyId = data.Target?.serverId ?? caller.source;
    const isValid = await RPC.execute<boolean>('admin:command:isValidPed', plyId, GetHashKey(data.model));
    if (!isValid) {
      Notifications.add(caller.source, 'Model bestaat niet', 'error');
      return;
    }

    Events.emitNet('admin:command:setModel', plyId, data.model);
    Notifications.add(caller.source, 'Model van speler veranderd', 'success');
  },
  UI: {
    title: 'Change Model',
    info: {
      inputs: [Inputs.Player],
      overrideFields: ['model'],
    },
  },
};
