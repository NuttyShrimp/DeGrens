import { Events, Notifications, PolyTarget, RPC } from '@dgx/client';
import { STORE_DATA } from 'config/stores';

export const buildSafeZone = (storeId: Store.Id) => {
  PolyTarget.addCircleZone(
    'store_safe',
    STORE_DATA[storeId].safecoords,
    0.5,
    {
      data: {},
    },
    true
  );
};

export const destroySafeZone = () => {
  PolyTarget.removeZone('store_safe');
};

export const checkSafeState = async (storeId: Store.Id) => {
  const isSafeHacker = await RPC.execute<boolean>('storerobbery:server:isSafeHacker', storeId);
  if (!isSafeHacker) return;

  Notifications.add('Verbinding verbroken...', 'error');
  Events.emitNet('storerobbery:server:cancelHack', storeId);
};
