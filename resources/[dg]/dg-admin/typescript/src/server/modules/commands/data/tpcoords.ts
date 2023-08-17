import { Events, Notifications } from '@dgx/server';

declare interface TPCoordsData {
  x: string;
  y: string;
  z: string;
  // "coords splitted by commas and whitespace"
  vector3: string;
}

export const tpcoords: CommandData = {
  name: 'tpcoords',
  log: 'TPed to some coords',
  isClientCommand: false,
  target: [],
  role: 'developer',
  handler: (caller, data: TPCoordsData) => {
    let x: string, y: string, z: string;

    if (data.vector3) {
      [x, y, z] = data.vector3.split(',');
      if (!x || !y || !z) {
        Notifications.add(caller.source, 'Invalid vector entered (should be comma seperated)', 'error');
        return;
      }
    } else {
      x = data.x;
      y = data.y;
      z = data.z;
    }

    try {
      const coords = {
        x: +x.replace(/[^0-9.-]*/, ''),
        y: +y.replace(/[^0-9.-]*/, ''),
        z: +z.replace(/[^0-9.-]*/, ''),
      };
      Events.emitNet('admin:util:setPedCoordsKeepVehicle', caller.source, coords);
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, 'Failed to teleport, could the values be invalid?', 'error');
    }
  },
  UI: {
    title: 'Teleport to coords',
    info: {
      overrideFields: ['x', 'y', 'z', 'vector3'],
    },
  },
};
