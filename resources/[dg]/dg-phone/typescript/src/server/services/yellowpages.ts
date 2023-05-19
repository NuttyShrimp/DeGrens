import { Core, Events, RPC, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

let ads: Ad[] = [];

const getAdByPhone = (phone: string) => {
  return ads.find(ad => ad.phone === phone);
};

Core.onPlayerUnloaded((plyId, _, plyData) => {
  ads = ads.filter(ad => ad.phone !== plyData.charinfo.phone);
  emitNet('dg-phone:client:yp:setAd', plyId, null);
});

RPC.register('dg-phone:server:yp:get', () => {
  return ads;
});

Events.onNet('dg-phone:server:yp:add', (src, data) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  let ad = getAdByPhone(player.charinfo.phone);
  if (!ad) {
    ad = {
      id: ads.length + 1,
      name: `${player.charinfo.firstname} ${player.charinfo.lastname}`,
      phone: player.charinfo.phone,
      text: data.text,
    };
    ads.push(ad);
  } else {
    ad.text = data.text;
  }
  emitNet('dg-phone:client:yp:setAd', src, ad);
});

Events.onNet('dg-phone:server:yp:remove', src => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  ads = ads.filter(ad => ad.phone !== player.charinfo.phone);
  emitNet('dg-phone:client:yp:setAd', src, null);
});

RPC.register('dg-phone:server:yp:getCurrentAd', src => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  return getAdByPhone(player.charinfo.phone);
});
