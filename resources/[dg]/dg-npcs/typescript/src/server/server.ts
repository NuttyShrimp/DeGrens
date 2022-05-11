import { RPC } from '@dgx/server/classes';
import { NPC_DATA } from 'constants/npcs';

RPC.register('npcs:server:fetch', (_src: number) => {
  return NPC_DATA;
});
