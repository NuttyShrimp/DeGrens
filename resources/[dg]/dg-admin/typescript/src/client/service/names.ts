import { Events } from '@dgx/client';

const plyNames: Record<number, string> = {};

Events.onNet('admin:names:set', (serverId: number, name: string) => {
  plyNames[serverId] = name;
});

Events.onNet('admin:names:delete', (serverId: number) => {
  delete plyNames[serverId];
});

export const getPlayerName = (serverId: number) => {
  return plyNames[serverId] ?? 'Unknown Player';
};
