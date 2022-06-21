import { Events, Notifications, PolyTarget, RPC } from '@dgx/client';

export const buildSafeZone = async (storeId: Store.Id) => {
  const safeCoords = await RPC.execute<Vec3>('storerobbery:server:getSafeCoords', storeId);
  PolyTarget.addCircleZone(
    'store_safe',
    safeCoords,
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
