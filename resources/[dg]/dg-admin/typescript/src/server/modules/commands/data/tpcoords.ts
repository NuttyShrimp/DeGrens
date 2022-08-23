import { Notifications } from '@dgx/server';

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
    const callerPed = GetPlayerPed(String(caller.source));
    if (data.vector3) {
      const [x, y, z] = data.vector3.split(',');
      if (!x || !y || !z) {
        Notifications.add(caller.source, 'Invalid vector entered (should be comma seperated)', 'error');
        return;
      }
      try {
        SetEntityCoords(
          callerPed,
          parseInt(x.trim()),
          parseInt(y.trim()),
          parseInt(z.trim()),
          true,
          false,
          false,
          false
        );
      } catch (e) {
        console.error(e);
        Notifications.add(caller.source, 'Failed to teleport, Could the vector be invalid?', 'error');
      }
      return;
    }
    try {
      SetEntityCoords(
        callerPed,
        parseInt(data.x.trim()),
        parseInt(data.y.trim()),
        parseInt(data.z.trim()),
        true,
        false,
        false,
        false
      );
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
