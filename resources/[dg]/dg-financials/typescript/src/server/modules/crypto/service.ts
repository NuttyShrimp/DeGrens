import { Core } from '@dgx/server';
import cryptoManager from './classes/CryptoManager';
import { CryptoWallet } from './classes/CryptoWallet';
import { cryptoLogger } from './util';

// Will get all the wallets in object form for this player
export const getPlayerInfo = (src: number): NCrypto.Wallet[] => {
  const Player = Core.getPlayer(src);
  if (!Player) return [];
  const wallets = cryptoManager.getWallet(Player.citizenid) as CryptoWallet[];
  return wallets.map(wallet => {
    return wallet.getClientVersion();
  });
};

export const buyCrypto = async (src: number, coin: string, amount: number): Promise<boolean> => {
  const Player = Core.getPlayer(src);
  if (!Player) {
    cryptoLogger.error(`buyCrypto: No player found for serverId: ${src}`);
    return false;
  }
  const wallet = cryptoManager.getWallet(Player.citizenid, coin) as CryptoWallet;
  if (!wallet) {
    cryptoLogger.warn(
      `buyCrypto: No wallet found for player: ${Player.citizenid} and coin: ${coin}. Creating wallet...`
    );
    const isSuccess = await cryptoManager.createWallet(Player.citizenid, coin);
    if (!isSuccess) {
      return false;
    }
    return buyCrypto(src, coin, amount);
  }
  return wallet.buy(amount);
};

export const addCrypto = async (src: number, coin: string, amount: number, comment: string): Promise<boolean> => {
  const Player = Core.getPlayer(src);
  if (!Player) {
    cryptoLogger.error(`addCrypto: No player found for serverId: ${src}`);
    return false;
  }
  const wallet = cryptoManager.getWallet(Player.citizenid, coin) as CryptoWallet;
  if (!wallet) {
    cryptoLogger.warn(
      `addCrypto: No wallet found for player: ${Player.citizenid} and coin: ${coin}. Creating wallet...`
    );
    const isSuccess = await cryptoManager.createWallet(Player.citizenid, coin);
    if (!isSuccess) {
      return false;
    }
    return addCrypto(src, coin, amount, comment);
  }
  return wallet.add(amount, comment);
};

export const removeCrypto = async (src: number, coin: string, amount: number): Promise<boolean> => {
  const Player = Core.getPlayer(src);
  if (!Player) {
    cryptoLogger.error(`removeCrypto: No player found for serverId: ${src}`);
    return false;
  }
  const wallet = cryptoManager.getWallet(Player.citizenid, coin) as CryptoWallet;
  if (!wallet) {
    cryptoLogger.warn(
      `removeCrypto: No wallet found for player: ${Player.citizenid} and coin: ${coin}. Creating wallet...`
    );
    const isSuccess = await cryptoManager.createWallet(Player.citizenid, coin);
    if (!isSuccess) {
      return false;
    }
    return removeCrypto(src, coin, amount);
  }
  return wallet.remove(amount);
};

export const getCryptoAmount = async (src: number, coin: string): Promise<number> => {
  const Player = Core.getPlayer(src);
  if (!Player) {
    cryptoLogger.error(`getCryptoAmount: No player found for serverId: ${src}`);
    return 0;
  }
  const wallet = cryptoManager.getWallet(Player.citizenid, coin) as CryptoWallet;
  if (!wallet) {
    cryptoLogger.warn(
      `getCryptoAmount: No wallet found for player: ${Player.citizenid} and coin: ${coin}. Creating wallet...`
    );
    const isSuccess = await cryptoManager.createWallet(Player.citizenid, coin);
    if (!isSuccess) {
      return 0;
    }
    return getCryptoAmount(src, coin);
  }
  return wallet.getClientVersion().amount;
};
