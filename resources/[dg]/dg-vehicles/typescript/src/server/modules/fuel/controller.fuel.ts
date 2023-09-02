import { Events } from '@dgx/server';
import { doRefuel, openRefuelMenu } from './service.fuel';

Events.onNet('vehicles:fuel:doRefuel', (src, netId: number, usingJerryCan: boolean) => {
  doRefuel(src, netId, usingJerryCan);
});

Events.onNet('vehicles:fuel:openRefuelMenu', (src, netId: number) => {
  openRefuelMenu(src, netId);
});
