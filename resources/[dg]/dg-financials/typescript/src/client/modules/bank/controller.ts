import { LocationManager } from '../../classes/LocationManager';

import { doAnimation } from './service';

import { RPC } from '@dgx/client';

const LManager = LocationManager.getInstance();

onNet('dg-polyzone:enter', (name: string, data: any) => {
  if (name !== 'bank') return;
  LManager.setLocation(data.id);
});

onNet('dg-polyzone:exit', (name: string) => {
  if (name !== 'bank') return;
  LManager.setLocation(null);
});

onNet('dg-lib:keyEvent', (name: string, isDown: boolean) => {
  if (name != 'GeneralUse' || !isDown) return;
  LManager.openMenu();
});

onNet('financials:client:SetBankDisabled', (name: string, isDisabled: boolean) => {
  if (!LManager.currentLocation || LManager.currentLocation.getName() !== name) return;
  LManager.currentLocation.setDisabled(isDisabled);
});

on('dg-ui:application-closed', (app: string) => {
  if (app !== 'financials') return;
  doAnimation(LManager.isAtAtm(), false);
  LManager.setAtATM(false);
});

DGX.UI.RegisterUICallback('financials/accounts/get', async (_: null, cb) => {
  if (!LManager.isInALocation()) return;
  const accounts = await RPC.execute<IAccount[]>('financials:server:account:get');
  cb({
    data: accounts,
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

DGX.UI.RegisterUICallback('financials/transactions/get', async (data: any, cb) => {
  if (!LManager.isInALocation()) return;
  cb({
    data: await RPC.execute<ITransaction[]>('financials:server:transactions:get', data),
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

// Actions
DGX.UI.RegisterUICallback('financials/account/deposit', (data: any, cb) => {
  if (!LManager.isInALocation()) return;
  RPC.execute<void>('financials:server:action:deposit', data);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

DGX.UI.RegisterUICallback('financials/account/withdraw', (data: any, cb) => {
  if (!LManager.isInALocation()) return;
  RPC.execute<void>('financials:server:action:withdraw', data);
  cb({
    data: {},
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

DGX.UI.RegisterUICallback('financials/account/transfer', async (data: any, cb) => {
  if (!LManager.isInALocation()) return;
  const isSuccess = await RPC.execute<boolean>('financials:server:action:transfer', data);
  cb({
    data: isSuccess,
    meta: {
      ok: true,
      message: 'done',
    },
  });
});

DGX.UI.RegisterUICallback('financials/cash/get', async (_, cb) => {
  if (!LManager.isInALocation()) return 0;
  const cash = await RPC.execute<number>('financials:server:cash:get');
  cb({
    data: cash,
    meta: {
      ok: true,
      message: 'done',
    },
  });
});
