import { Events, Notifications } from '@dgx/server';
import { Inputs } from '../../../enums/inputs';

declare interface OpenBennysData {
  Target?: UI.Player;
  free: boolean;
}

export const openBennys: CommandData = {
  name: 'openBennys',
  role: 'staff',
  log: 'has opened bennys menu',
  isClientCommand: false,
  target: [],
  handler: (caller, args: OpenBennysData) => {
    const plyId = args?.Target?.serverId ?? caller.source;
    if (!GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false)) {
      Notifications.add(caller.source, 'Speler zit niet in een voertuig', 'error');
      return;
    }
    if (plyId === caller.source) {
      Events.emitNet('admin:menu:forceClose', caller.source);
    }
    Events.emitNet('vehicles:bennys:enter', plyId);
    if (args?.free) {
      emit('vehicles:bennys:registerNoChargeSpot', plyId);
    }
  },
  UI: {
    title: 'Open Bennys',
    info: {
      inputs: [Inputs.Player],
      checkBoxes: ['free'],
    },
  },
};
