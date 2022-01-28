import { CryptoManager } from './classes/CryptoManager';
import { addCrypto, buyCrypto, getPlayerInfo, loadPlayerWallet } from './service';
import { cryptoLogger } from './util';
import { CryptoWallet } from './classes/CryptoWallet';

const CManager = CryptoManager.getInstance();

global.exports('cryptoBuy', buyCrypto);
global.exports('cryptoAdd', addCrypto);

RegisterCommand(
	'financials:crypto:seed',
	() => {
		CManager.reloadCoins();
	},
	true
);

onNet('DGCore:Server:OnPlayerLoaded', () => {
	loadPlayerWallet(source);
});

DGCore.Functions.CreateCallback('financials:server:crypto:getInfo', (src, cb) => {
	cryptoLogger.silly('Callback: getInfo');
	const coins = CManager.getCoins();
	const wallets = getPlayerInfo(src);
	const combinedInfo: (NCrypto.Coin & { wallet: NCrypto.Wallet })[] = coins.map(coin => {
		return {
			...coin,
			wallet: wallets.find(wallet => wallet.cname === coin.crypto_name),
		};
	});
	cryptoLogger.silly(`Callback: getInfo: ${combinedInfo.map(c => `${c.crypto_name}: ${c.wallet.amount}`).join(', ')}`);
	cb(combinedInfo);
});

DGCore.Functions.CreateCallback(
	'financials:server:crypto:transfer',
	async (
		src,
		cb,
		data: {
			coin: string;
			target: number;
			amount: number;
		}
	) => {
		cryptoLogger.silly(`Callback: transfer: coin: ${data.coin} | target: ${data.target} | amount: ${data.amount}`);
		const Player = DGCore.Functions.GetPlayer(src);
		const wallet = CManager.getWallet(Player.PlayerData.citizenid, data.coin) as CryptoWallet;
		const success = await wallet.transfer(src, data.target, data.amount);
		cryptoLogger.silly(`Callback: transfer: success: ${success}`);
		cb(success);
	}
);

DGCore.Functions.CreateCallback(
	'financials:server:crypto:buy',
	async (src, cb, data: { coin: string; amount: number }) => {
		cryptoLogger.silly(`Callback: buy: coin: ${data.coin} | amount: ${data.amount}`);
		const Player = DGCore.Functions.GetPlayer(src);
		const wallet = CManager.getWallet(Player.PlayerData.citizenid, data.coin) as CryptoWallet;
		const success = await wallet.buy(data.amount);
		cryptoLogger.silly(`Callback: buy: success: ${success}`);
		cb(success);
	}
);
