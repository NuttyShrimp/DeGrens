import { RPC } from '@dgx/server';
import { getPlayerScope, playerDropped, playerEnteredScope, playerLeftScope } from './service.scopes';

on('playerEnteredScope', (data: { for: string; player: string }) => {
  const playerEntering = Number(data.player);
  const player = Number(data.for);

  playerEnteredScope(player, playerEntering);
});

on('playerLeftScope', (data: { for: string; player: string }) => {
  const playerLeaving = Number(data.player);
  const player = Number(data.for);

  playerLeftScope(player, playerLeaving);
});

on('playerDropped', () => {
  const droppedPlayer = Number(source);
  if (!droppedPlayer) return;

  playerDropped(droppedPlayer);
});

global.exports('getPlayerScope', getPlayerScope);

RPC.register('sync:players:count', () => {
  return GetNumPlayerIndices();
});
