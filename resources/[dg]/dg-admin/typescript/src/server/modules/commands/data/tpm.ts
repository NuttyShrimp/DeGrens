import { Events, RPC } from '@dgx/server';

export const tpid: CommandData = {
  name: 'tpm',
  role: 'staff',
  log: 'teleported to your waypoint',
  target: false,
  isClientCommand: false,
  handler: async caller => {
    const waypointCoords = await RPC.execute<Vec3>('admin:cmd:getWaypointCoords', caller.source);
    if (!waypointCoords) return;
    Events.emitNet('admin:util:setPedCoordsKeepVehicle', caller.source, waypointCoords);
  },
  UI: {
    title: 'Teleport to your waypoint',
    bindable: true,
  },
};
