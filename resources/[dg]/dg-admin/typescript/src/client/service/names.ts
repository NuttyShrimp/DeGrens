import { Events } from '@dgx/client';

let plyNames: Record<number, string> = {};

Events.onNet('admin:names:init', (names: Record<number, string>) => {
  plyNames = names;
});

Events.onNet('admin:names:set', (serverId: number, name: string) => {
  plyNames[serverId] = name;
});

Events.onNet('admin:names:delete', (serverId: number) => {
  delete plyNames[serverId];
});

export const getPlayerName = (serverId: number) => {
  return plyNames[serverId] ?? 'Unknown Player';
};
