import { Events } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface FixScreenFadeoutData {
  Target?: UI.Player;
  execute: boolean;
}

export const toggleKeybindExecution: CommandData = {
  name: 'toggleKeybindExecution',
  log: 'toggled a persons lib keybinds execution',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: (caller, data: FixScreenFadeoutData) => {
    const plyId = data.Target?.serverId ?? caller.source;
    Events.emitNet('lib:keys:shouldExecuteKeyMaps', plyId, data.execute);
  },
  UI: {
    title: 'Toggle Keybind Execution',
    info: {
      inputs: [Inputs.Player],
      checkBoxes: ['execute'],
    },
  },
};
