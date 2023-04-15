import { Keys, PolyZone, RPC, UI } from '@dgx/client';
import locationManager from 'classes/LocationManager';

import { doAnimation } from './service';

PolyZone.onEnter<{ id: string }>('bank', (_, data) => {
  locationManager.setLocation(data.id);
});
PolyZone.onLeave('bank', () => {
  locationManager.setLocation(null);
});

Keys.onPressDown('GeneralUse', () => {
  locationManager.openMenu();
});

onNet('financials:client:SetBankDisabled', (name: string, isDisabled: boolean) => {
  if (!locationManager.currentLocation || locationManager.currentLocation.getName() !== name) return;
  locationManager.currentLocation.setDisabled(isDisabled);
});

UI.onApplicationClose(() => {
  doAnimation(locationManager.isAtAtm(), false);
  locationManager.setAtATM(false);
}, 'financials');

UI.RegisterUICallback('financials/accounts/get', async (_, cb) => {
  if (!locationManager.isInALocation()) return;
  const accounts = await RPC.execute<IAccount[]>('financials:server:account:get');
  cb({
    data: accounts ?? [],
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('financials/transactions/get', async (data, cb) => {
  if (!locationManager.isInALocation()) return;
  const { _character, ...dataWithoutChar } = data;
  cb({
    data: await RPC.execute('financials:server:transactions:get', dataWithoutChar),
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('financials/account/deposit', async (data, cb) => {
  if (!locationManager.isInALocation()) return;
  const { _character, ...dataWithoutChar } = data;
  await RPC.execute<void>('financials:server:action:deposit', dataWithoutChar);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('financials/account/withdraw', async (data, cb) => {
  if (!locationManager.isInALocation()) return;
  const { _character, ...dataWithoutChar } = data;
  await RPC.execute<void>('financials:server:action:withdraw', dataWithoutChar);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('financials/account/transfer', async (data, cb) => {
  if (!locationManager.isInALocation()) return;
  const { _character, ...dataWithoutChar } = data;
  const isSuccess = await RPC.execute<boolean>('financials:server:action:transfer', dataWithoutChar);
  cb({
    data: isSuccess,
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('financials/cash/get', async (_, cb) => {
  if (!locationManager.isInALocation()) return 0;
  const cash = await RPC.execute<number>('financials:server:cash:get');
  cb({
    data: cash,
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

UI.RegisterUICallback('financials/account/updatePermissions', async (data, cb) => {
  if (!locationManager.isInALocation()) return;
  await RPC.execute('financials:bank:savings:updatePermissions', data.accountId, data.cid, {
    deposit: data.deposit ?? false,
    withdraw: data.withdraw ?? false,
    transfer: data.transfer ?? false,
    transactions: data.transactions ?? false,
  });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
