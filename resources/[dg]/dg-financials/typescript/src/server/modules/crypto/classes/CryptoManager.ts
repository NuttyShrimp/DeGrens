import { SQL } from '@dgx/server';
import { Util } from '@dgx/shared';
import { getConfig } from 'helpers/config';
import winston from 'winston';

import { cryptoLogger } from '../util';

import { CryptoWallet } from './CryptoWallet';
import { charModule } from 'helpers/core';

class CryptoManager extends Util.Singleton<CryptoManager>() {
  private coinsLoaded: boolean;
  private coins: NCrypto.Coin[];
  private readonly coinWallets: Map<number, CryptoWallet[]>;
  private readonly logger: winston.Logger;

  constructor() {
    super();
    this.coins = [];
    this.coinsLoaded = false;
    this.coinWallets = new Map();
    this.logger = cryptoLogger.child({ module: 'CryptoManager' });
  }

  public async initiate(): Promise<void> {
    this.coins = [];
    this.coinWallets.clear();
    this.coinsLoaded = false;

    await this.loadCoins();
    Object.values(charModule.getAllPlayers()).forEach(p => {
      this.loadPlayerWallet(p.citizenid);
    });
    this.logger.info('Initalisation succesful');
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
      return [];
    }
    return wallet;
  }

  public async loadPlayerWallet(cid: number) {
    await Util.awaitCondition(() => this.coinsLoaded);
    await this.fetchWalletDB(cid);
  }

  private async loadCoins(): Promise<void> {
    const cryptoConfig = getConfig().cryptoCoins.reduce<Record<string, NCrypto.Config>>((acc, coin) => {
      acc[coin.name] = coin;
      return acc;
    }, {});

    const result = (await SQL.query('SELECT * FROM crypto')) as DB.ICrypto[] | undefined;
    if (result != undefined && result.length !== 0) {
      result.forEach(coin => {
        if (!cryptoConfig[coin.crypto_name]) {
          this.logger.warn(`Coin ${coin.crypto_name} is not in the config`);
          return;
        }
        this.coins.push({
          ...coin,
          icon: cryptoConfig[coin.crypto_name].icon,
        });
        this.logger.debug(`Loaded coin ${coin.crypto_name}`);
      });
      this.logger.info(`Loaded ${this.coins.length} coins from database`);
    } else {
      this.logger.warn(`No coins fetched from database`);
    }

    await this.addMissingCoins();
    this.coinsLoaded = true;
  }

  private async addMissingCoins() {
    const missingCoins = getConfig().cryptoCoins.filter(coin => !this.coins.find(c => c.crypto_name === coin.name));
    if (missingCoins.length === 0) return;

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

  public async createWallet(cid: number, coin: string): Promise<boolean> {
    await Util.awaitCondition(() => this.coinsLoaded);
    const plyId = charModule.getServerIdFromCitizenId(cid);
    if (!plyId) {
      this.logger.warn(`No player found for ${cid}`);
      return false;
    }
    const coinInfo = this.coins.find(c => c.crypto_name === coin);
    if (!coinInfo) {
      this.logger.warn(`No coin found for ${coin}`);
      return false;
    }
    const coinConfig = getConfig().cryptoCoins.find(c => c.name === coin);
    if (!coinConfig) {
      this.logger.warn(`No config found for ${coin}`);
      return false;
    }
    const wallet = new CryptoWallet(cid, coin, 0, coinConfig);
    await wallet.saveWallet();
    this.logger.debug(`Created wallet for ${cid} | coin: ${coin}`);
    this.addWallet(cid, wallet);
    return true;
  }

  private addWallet(cid: number, wallet: CryptoWallet) {
    if (!this.coinWallets.has(cid)) {
      this.coinWallets.set(cid, []);
    }
    this.coinWallets.get(cid)!.push(wallet);
  }

  private async fetchWalletDB(cid: number): Promise<void> {
    const query = `SELECT *
									 FROM crypto_wallets
									 WHERE cid = ?`;
    let result: DB.ICryptoWallet[] = await SQL.query(query, [cid]);
    result = result ?? [];

    result.forEach(wallet => {
      const coinConfig = getConfig().cryptoCoins.find(c => c.name === wallet.crypto_name);
      if (!coinConfig) {
        this.logger.silly(`Coin ${wallet.crypto_name} in wallet of player ${wallet.cid} does not exist in config`);
        return;
      }
      this.addWallet(cid, new CryptoWallet(cid, wallet.crypto_name, wallet.amount, coinConfig));
      this.logger.silly(`Loaded wallet ${wallet.crypto_name} for ${cid}`);
    });

    const missingCoins = this.coins.filter(coin => result.findIndex(r => r.crypto_name === coin.crypto_name) === -1);
    if (missingCoins.length === 0) return;

    this.logger.debug(`Missing coins for ${cid}: ${missingCoins.map(c => c.crypto_name).join(', ')}`);
    missingCoins.forEach(coin => {
      const coinConfig = getConfig().cryptoCoins.find(c => c.name === coin.crypto_name);
      if (!coinConfig) return;
      this.createWallet(cid, coin.crypto_name);
    });
  }
}

const cryptoManager = CryptoManager.getInstance();
export default cryptoManager;
