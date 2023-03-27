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
    if (data.vector3) {
      const [x, y, z] = data.vector3.split(',');
      if (!x || !y || !z) {
        Notifications.add(caller.source, 'Invalid vector entered (should be comma seperated)', 'error');
        return;
      }
      try {
        const coords = {
          x: parseInt(x.replace(/.*((\d|\.)+.*/, '$1').trim()),
          y: parseInt(y.replace(/.*((\d|\.)+.*/, '$1').trim()),
          z: parseInt(z.replace(/.*((\d|\.)+.*/, '$1').trim()),
        };
        Events.emitNet('admin:util:setPedCoordsKeepVehicle', caller.source, coords);
      } catch (e) {
        console.error(e);
        Notifications.add(caller.source, 'Failed to teleport, Could the vector be invalid?', 'error');
      }
      return;
    }
    try {
      const coords = {
        x: parseInt(data.x.trim()),
        y: parseInt(data.y.trim()),
        z: parseInt(data.z.trim()),
      };
      Events.emitNet('admin:util:setPedCoordsKeepVehicle', caller.source, coords);
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, 'Failed to teleport, Could the vector be invalid?', 'error');
    }
  },
  UI: {
    title: 'Teleport to coords',
    info: {
      overrideFields: ['x', 'y', 'z', 'vector3'],
    },
  },
};
