import { Events } from '@dgx/server';
import { Inputs } from 'enums/inputs';

const DEBUG_OPTIONS = {
  polyzone: (plyId: number, toggle: boolean) => {
    Events.emitNet('polyzone:debug:toggle', plyId, toggle);
  },
  polytarget: (plyId: number, toggle: boolean) => {
    Events.emitNet('polytarget:debug:toggle', plyId, toggle);
  },
  raycast: (plyId: number, toggle: boolean) => {
    Events.emitNet('raycast:debug:toggle', plyId, toggle);
  },
  baseevents: (plyId: number, toggle: boolean) => {
    emitNet('baseevents:toggleDebug', plyId, toggle);
  },
};

declare type ToggleDebugData = {
  Target?: UI.Player;
} & Record<keyof typeof DEBUG_OPTIONS, boolean | undefined>;

export const toggleDebug: CommandData = {
  name: 'toggleDebug',
  log: 'has toggled debug mode',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: (caller, data: ToggleDebugData) => {
    const { Target, ...options } = data;
    const plyId = Target?.serverId ?? caller.source;

    for (const [key, selected] of Object.entries(options)) {
      DEBUG_OPTIONS[key as keyof typeof DEBUG_OPTIONS](plyId, selected ?? false);
    }
  },
  UI: {
    title: 'Toggle Debug Mode',
    info: {
      inputs: [Inputs.Player],
      checkBoxes: Object.keys(DEBUG_OPTIONS),
    },
  },
};
