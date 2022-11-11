import { Peek } from '@dgx/client';
import contextManager from 'classes/contextmanager';

Peek.addFlagEntry('isShopKeeper', {
  options: [
    {
      label: 'Open Winkel',
      icon: 'basket-shopping',
      action: (_, entity) => {
        if (!entity) return;
        PlayPedAmbientSpeechNative(entity, 'SHOP_GREET', 'SPEECH_PARAMS_FORCE_SHOUTED');
        const npcId: string = global.exports['dg-npcs'].findPedData(entity)?.id;
        if (!npcId) return;
        const shop = npcId.replace(/^(shop_)/, '');
        contextManager.openInventory({ type: 'shop', identifier: shop });
      },
    },
  ],
  distance: 3.0,
});
