import { Notifications } from '@dgx/server';

import { SelectorTarget } from '../../../enums/SelectorTargets';

interface ClearServiceStatus {
  entity?: number;
}

export const clearServiceStatus: CommandData = {
  name: 'clearServiceStatus',
  role: 'staff',
  target: [SelectorTarget.VEHICLE],
  isClientCommand: false,
  log: 'has cleared service status',
  handler: (caller, args: ClearServiceStatus) => {
    let vehicle = args?.entity;
    if (!vehicle || !DoesEntityExist(vehicle)) return;

    global.exports['dg-vehicles'].clearServiceStatus(vehicle);
    Notifications.add(caller.source, 'Service status reset', 'error');
  },
  UI: {
    title: 'Clear Service Status',
  },
};
