import winston from 'winston';
import { SQL } from '@ts-shared/server';

import { config } from '../../../config';
import { cryptoLogger } from '../util';

import { CryptoWallet } from './CryptoWallet';

export class CryptoManager {
  private static _instance: CryptoManager;

  public static getInstance(): CryptoManager {
    if (!CryptoManager._instance) {
      CryptoManager._instance = new CryptoManager();
    }
    return CryptoManager._instance;
  }

  private coins: NCrypto.Coin[];
  private coinsLoaded: boolean;
  private coinWallets: Map<number, CryptoWallet[]>;
  private logger: winston.Logger;

  constructor() {
    this.coins = [];
    this.coinWallets = new Map();
    this.logger = cryptoLogger.child({ module: 'CryptoManager' });
    this.loadCoins();
    this.logger.info('CryptoManager initialized');
  }

  // region Coins
  public async reloadCoins(): Promise<void> {
    this.logger.info('Reloading manager');
    this.coins = [];
    this.coinWallets = new Map();
    this.coinsLoaded = false;
    await this.loadCoins();
    Object.values(DGCore.Functions.GetQBPlayers()).forEach(p => {
      this.loadPlayerWallet(p.PlayerData.citizenid);
    });
    this.logger.info('Reloaded manager');
  }

  public getWallet(cid: number, coin?: string): CryptoWallet | CryptoWallet[] {
    const wallets = this.coinWallets.get(cid);
    if (!wallets) {
      this.logger.debug(`No wallet found for ${cid}, creating`);
      return [];
    }
    if (!coin) {
      return wallets;
    }
    const wallet = wallets.find(w => w.getCoin() === coin);
    if (!wallet) {
      this.logger.debug(`No wallet found for ${cid} | coin: ${coin}`);
      return;
    }
    return wallet;
  }

  // endregion

  // region Wallet
  public async loadPlayerWallet(cid: number) {
    await this.waitForCoinsLoaded();
    const Player = DGCore.Functions.GetPlayerByCitizenId(cid);
    if (!Player) {
      this.logger.warn(`No player found for ${cid}`);
      return;
    }
    await this.fetchWalletDB(cid);
  }

  // region Generic
  private async waitForCoinsLoaded(): Promise<void> {
    while (!this.coinsLoaded) {
      await DGX.Util.Delay(100);
    }
  }

  // region DB
  private async loadCoins(): Promise<void> {
    const query = `SELECT *
									 FROM crypto`;
    const result = await SQL.query(query);
    if (!result || result.length === 0) {
      this.logger.warn(`Could not load coins from DB`);
      await this.addMissingCoins();
      this.coinsLoaded = true;
      return;
    }
    result.forEach((c: DB.ICrypto) => {
      if (!config.crypto.coins.find(coin => coin.name === c.crypto_name)) {
        this.logger.warn(`Coin ${c.crypto_name} is not in the config`);
        return;
      }
      const coinConfig = config.crypto.coins.find(cc => cc.name === c.crypto_name);
      const newCoin: NCrypto.Coin = {
        ...c,
        icon: coinConfig.icon,
      };
      this.coins.push(newCoin);
      this.logger.debug(`Loaded coin ${c.crypto_name}`);
    });
    this.logger.info(`Loaded ${this.coins.length} coins`);
    await this.addMissingCoins();
    this.coinsLoaded = true;
  }

  // endregion

  private async addMissingCoins(): Promise<void> {
    const configCoins = config.crypto.coins;
    const missingCoins = configCoins.filter(coin => !this.coins.find(c => c.crypto_name === coin.name));
    if (missingCoins.length === 0) {
      return;
    }
    for (const coin of missingCoins) {
      const query = `INSERT INTO crypto (crypto_name, value)
										 VALUES (?, ?)`;
      const result = await SQL.query(query, [coin.name, coin.value ?? 0]);
      if (!result) {
        this.logger.warn(`Could not add missing coin ${coin.name} to DB`);
        continue;
      }
      const newCoin: NCrypto.Coin = {
        crypto_name: coin.name,
        icon: coin.icon,
        value: coin.value ?? 0,
      };
      this.coins.push(newCoin);
      this.logger.debug(`Added missing coin ${coin.name} to DB`);
    }
  }

  public getCoins(): NCrypto.Coin[] {
    return this.coins;
  }

  // endregion

  public async createWallet(cid: number, coin: string): Promise<boolean> {
    await this.waitForCoinsLoaded();
    const Player = DGCore.Functions.GetPlayerByCitizenId(cid);
    if (!Player) {
      this.logger.warn(`No player found for ${cid}`);
      return false;
    }
    const coinInfo = this.coins.find(c => c.crypto_name === coin);
    if (!coinInfo) {
      this.logger.warn(`No coin found for ${coin}`);
      return false;
    }
    const wallet = new CryptoWallet(cid, coin, 0);
    await wallet.saveWallet();
    this.logger.debug(`Created wallet for ${cid} | coin: ${coin}`);
    this.addWallet(cid, wallet);
    return true;
  }

  private addWallet(cid: number, wallet: CryptoWallet) {
    if (!this.coinWallets.has(cid)) {
      this.coinWallets.set(cid, []);
    }
    this.coinWallets.get(cid).push(wallet);
  }

  private async fetchWalletDB(cid: number): Promise<void> {
    const query = `SELECT *
									 FROM crypto_wallets
									 WHERE cid = ?`;
    let result: DB.ICryptoWallet[] = await SQL.query(query, [cid]);
    if (!result) {
      result = [];
    }
    result.forEach(row => {
      this.addWallet(cid, new CryptoWallet(cid, row.crypto_name, row.amount));
      this.logger.silly(`Loaded wallet ${row.crypto_name} for ${cid}`);
    });
    const missingCoins = this.coins.filter(coin => result.findIndex(r => r.crypto_name === coin.crypto_name) === -1);
    if (missingCoins.length === 0) {
      return;
    }
    this.logger.debug(`Missing coins for ${cid}: ${missingCoins.map(c => c.crypto_name).join(', ')}`);
    missingCoins.forEach(coin => {
      this.addWallet(cid, new CryptoWallet(cid, coin.crypto_name, 0));
      // Save the wallet
      this.coinWallets
        .get(cid)
        .find(w => w.getCoin() === coin.crypto_name)
        .saveWallet();
    });
  }

  // endregion
}
