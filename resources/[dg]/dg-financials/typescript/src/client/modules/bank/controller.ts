import { LocationManager } from '../../classes/LocationManager';
import { RegisterUICallback } from '../../util';
import { doAnimation } from './service';

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

RegisterUICallback('accounts/get', async (_: null) => {
	if (!LManager.isInALocation()) return;
	const accounts = await DGCore.Functions.TriggerCallback<IAccount[]>('financials:server:account:get');
	return accounts;
});

RegisterUICallback('transactions/get', async (data: any) => {
	if (!LManager.isInALocation()) return;
	return DGCore.Functions.TriggerCallback<ITransaction[]>('financials:server:transactions:get', data);
});

// Actions
RegisterUICallback('account/deposit', (data: any) => {
	if (!LManager.isInALocation()) return;
	DGCore.Functions.TriggerCallback<void>('financials:server:action:deposit', data);
	return 'ok';
});

RegisterUICallback('account/withdraw', (data: any) => {
	if (!LManager.isInALocation()) return;
	DGCore.Functions.TriggerCallback<void>('financials:server:action:withdraw', data);
	return 'ok';
});

RegisterUICallback('account/transfer', async (data: any) => {
	if (!LManager.isInALocation()) return;
	const isSuccess = await DGCore.Functions.TriggerCallback<boolean>('financials:server:action:transfer', data);
	return isSuccess;
});

RegisterUICallback('cash/get', async () => {
	if (!LManager.isInALocation()) return 0;
	const cash = await DGCore.Functions.TriggerCallback<number>('financials:server:cash:get');
	return cash;
});

RegisterUICallback('close', (_: any) => {
	SetNuiFocus(false, false);
	SendNUIMessage({ action: 'close' });
	doAnimation(LManager.isAtAtm(), false);
	LManager.setAtATM(false);
	return 'ok';
});
