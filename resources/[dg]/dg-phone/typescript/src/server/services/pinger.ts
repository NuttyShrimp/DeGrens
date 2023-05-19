import { Admin, Inventory, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

const pingManager: Map<string, any> = new Map();

const getPingId = () => {
  let id = Util.uuidv4();
  while (pingManager.has(id)) {
    id = Util.uuidv4();
  }
  return id;
};

onNet('dg-phone:pinger:request', (data: { isAnon?: boolean; target: number }) => {
  const src = source;
  data.target = Number(data.target);
  const Player = charModule.getPlayer(src);
  const Target = charModule.getPlayer(data.target);
  if (data.isAnon && !Inventory.doesPlayerHaveItems(src, 'vpn')) {
    Admin.ACBan(data.target, 'Sended an anonymous');
    return;
  }
  if (!Target || !Player) return;
  const pingId = getPingId();
  pingManager.set(pingId, {
    source: src,
    target: data.target,
    coords: Util.getPlyCoords(src),
  });
  emitNet('dg-phone:pinger:sendRequest', data.target, pingId, data.isAnon ? 'Anonymous Number' : Player.charinfo.phone);
});

onNet('dg-phone:pinger:accept', (data: { id: string }) => {
  const pingInfo = pingManager.get(data.id);
  if (!pingInfo) return;
  emitNet('dg-phone:pinger:setPingLocation', pingInfo.target, pingInfo.coords, data.id);
});

onNet('dg-phone:pinger:decline', (data: { id: string }) => {
  if (!data.id) return;
  pingManager.delete(data.id);
});
