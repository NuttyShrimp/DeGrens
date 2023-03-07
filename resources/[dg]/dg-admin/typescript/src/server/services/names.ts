import { Auth, Events, Util } from '@dgx/server';
import { hasPlayerPermission } from 'modules/permissions/service.permissions';

const plyNames: Record<number, string> = {};

// Dispatch joining player name to all support
on('playerJoining', () => {
  const src = source;
  const name = Util.getName(src);
  plyNames[src] = name;

  Util.getAllPlayers().forEach(ply => {
    if (!hasPlayerPermission(ply, 'support') || ply === src) return;
    Events.emitNet('admin:names:set', ply, src, name);
  });
});

// Dispatch delete action to all support about dropped player
on('playerDropped', () => {
  const src = source;
  delete plyNames[src];

  Util.getAllPlayers().forEach(ply => {
    if (!hasPlayerPermission(ply, 'support') || ply === src) return;
    Events.emitNet('admin:names:delete', ply, src);
  });
});

// Init names for plys already in server when support
Auth.onAuth(plyId => {
  if (!hasPlayerPermission(plyId, 'support')) return;
  Events.emitNet('admin:names:init', plyId, plyNames);
});
