import { Events, Util } from '@dgx/server';
import { hasPlayerPermission } from 'modules/permissions/service.permissions';

on('playerJoining', () => {
  const src = source;
  const name = Util.getName(src);
  Util.getAllPlayers().forEach(ply => {
    if (!hasPlayerPermission(ply, 'staff')) return;
    Events.emitNet('admin:names:set', ply, src, name);
  });
});

on('playerDropped', () => {
  const src = source;
  Util.getAllPlayers().forEach(ply => {
    if (!hasPlayerPermission(ply, 'staff')) return;
    Events.emitNet('admin:names:delete', ply, src);
  });
});
