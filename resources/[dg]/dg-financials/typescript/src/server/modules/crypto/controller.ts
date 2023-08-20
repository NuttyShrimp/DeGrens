import { Core, RPC } from '@dgx/server';
import cryptoManager from './classes/CryptoManager';

import { CryptoWallet } from './classes/CryptoWallet';
import { addCrypto, buyCrypto, getCryptoAmount, getPlayerInfo, removeCrypto } from './service';
import { cryptoLogger } from './util';
import { charModule } from 'helpers/core';

global.asyncExports('cryptoBuy', (src: number, coin: string, amount: number) => buyCrypto(src, coin, amount));
global.asyncExports('cryptoAdd', (src: number, coin: string, amount: number, comment: string) =>
  addCrypto(src, coin, amount, comment)
);
global.asyncExports('cryptoRemove', (src: number, coin: string, amount: number) => removeCrypto(src, coin, amount));
global.asyncExports('cryptoGet', (src: number, coin: string) => getCryptoAmount(src, coin));

RegisterCommand(
  'financials:crypto:seed',
  () => {
    cryptoManager.initiate();
  },
  true
);

Core.onPlayerLoaded(playerData => {
  cryptoManager.loadPlayerWallet(playerData.citizenid);
});

RPC.register('financials:server:crypto:getInfo', src => {
  cryptoLogger.silly('Callback: getInfo');
  const coins = cryptoManager.getCoins();
  const wallets = getPlayerInfo(src);
  const combinedInfo: (NCrypto.Coin & { wallet: NCrypto.Wallet })[] = coins.map(coin => {
    return {
      ...coin,
      wallet: wallets.find(wallet => wallet.cname === coin.crypto_name)!,
    };
  });
  cryptoLogger.silly(`Callback: getInfo: ${combinedInfo.map(c => `${c.crypto_name}: ${c.wallet.amount}`).join(', ')}`);
  return combinedInfo;
});

RPC.register(
  'financials:server:crypto:transfer',
  async (
    src,
    data: {
      coin: string;
      target: number;
      amount: number;
    }
  ) => {
    cryptoLogger.silly(`Callback: transfer: coin: ${data.coin} | target: ${data.target} | amount: ${data.amount}`);
    const Player = Core.getPlayer(src);
    if (!Player) return false;

    const targetCid = charModule.getPlayerByPhone(String(data.target))?.citizenid;
    if (!targetCid) return false;

    const wallet = cryptoManager.getWallet(Player.citizenid, data.coin) as CryptoWallet;
    const success = await wallet.transfer(src, targetCid, data.amount);
    cryptoLogger.silly(`Callback: transfer: success: ${success}`);
    return success;
  }
);

RPC.register('financials:server:crypto:buy', async (src, data: { coin: string; amount: number }) => {
  cryptoLogger.silly(`Callback: buy: coin: ${data.coin} | amount: ${data.amount}`);
  const Player = Core.getPlayer(src);
  if (!Player) return false;
  const wallet = cryptoManager.getWallet(Player.citizenid, data.coin) as CryptoWallet;
  const success = await wallet.buy(data.amount);
  cryptoLogger.silly(`Callback: buy: success: ${success}`);
  return success;
});
