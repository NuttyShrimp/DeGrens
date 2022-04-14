import winston from 'winston';
import {SQL} from '@ts-shared/server';

import { config } from '../../../config';
import { getDefaultAccount } from '../../bank/helpers/accounts';
import { cryptoLogger } from '../util';

import { CryptoManager } from './CryptoManager';

export class CryptoWallet {
  private cid: number;
  private cname: string;
  private amount: number;
  private config: NCrypto.Config;
  private logger: winston.Logger;
  private manager: CryptoManager;

  constructor(cid: number, cname: string, amount: number) {
    this.cid = cid;
    this.cname = cname;
    this.amount = amount;
    this.config = config.crypto.coins.find(coin => coin.name === this.cname);
    this.logger = cryptoLogger.child({ module: `CW-${this.cid}-${this.cname}` });
    this.manager = CryptoManager.getInstance();
  }

  // region Getters
  public getCoin(): string {
    return this.cname;
  }

  public getClientVersion(): NCrypto.Wallet {
    return {
      cid: this.cid,
      cname: this.cname,
      amount: this.amount,
    };
  }

  // endregion
  // region Actions
  private canBuyCoin() {
    return !!this.config?.value ?? false;
  }

  public async saveWallet() {
    const query = `
			INSERT INTO crypto_wallets (cid, crypto_name, amount)
			VALUES (?, ?, ?)
			ON DUPLICATE KEY UPDATE amount = ?
		`;
    const params = [this.cid, this.cname, this.amount, this.amount];
    await SQL.query(query, params);
  }

  public async buy(amount: number): Promise<boolean> {
    if (!this.canBuyCoin()) {
      this.logger.debug(`Buy: ${this.cname} can't be bought | cid: ${this.cid}`);
      return false;
    }
    const Player = DGCore.Functions.GetPlayerByCitizenId(this.cid);
    if (!Player) {
      this.logger.debug(`Buy: Player not found | cid: ${this.cid}`);
      return false;
    }
    const cid = Player.PlayerData.citizenid;
    const playerAccount = await getDefaultAccount(cid);
    const price = amount * this.config.value;
    const isSuccess = playerAccount.purchase(cid, price, `Aankoop crypto: ${amount}x ${this.cname}`);
    this.logger.debug(`Buy: ${isSuccess ? 'success' : 'fail'} | amount: ${amount} | price: ${price}`);
    if (isSuccess) {
      this.amount += amount;
      await this.saveWallet();
    }
    global.exports['dg-logs'].createGraylogEntry(
      'financials:crypto:buy',
      {
        cid,
        coin: this.cname,
        amount,
        newTotal: this.amount + amount,
        price,
        isSuccess,
      },
      `${isSuccess ? 'Successfully bought' : 'Failed to buy'} crypto: ${amount}x ${this.cname} | cid: ${this.cid}`
    );
    return isSuccess;
  }

  public async add(amount: number, comment: string): Promise<boolean> {
    const Player = DGCore.Functions.GetPlayerByCitizenId(this.cid);
    if (!Player) {
      this.logger.debug(`Add: Player not found | cid: ${this.cid}`);
      return false;
    }
    if (!comment) {
      this.logger.warn(`Add: Comment is empty | cid: ${this.cid}`);
    }
    const cid = Player.PlayerData.citizenid;
    this.amount += amount;
    await this.saveWallet();
    this.logger.debug(`Add: ${amount}`);
    global.exports['dg-logs'].createGraylogEntry(
      'financials:crypto:add',
      {
        cid,
        coin: this.cname,
        amount,
        newTotal: this.amount + amount,
        comment,
      },
      `Added crypto: ${amount}x ${this.cname} | cid: ${this.cid} | comment: ${comment}`
    );
    return true;
  }

  public async transfer(src: number, target: number, amount: number): Promise<boolean> {
    const Target = DGCore.Functions.GetPlayerByCitizenId(target);
    if (!Target) {
      this.logger.debug(`Transfer: Target not found | cid: ${this.cid}`);
      return false;
    }
    const targetWallet: CryptoWallet = this.manager.getWallet(target, this.cname) as CryptoWallet;
    if (!targetWallet) {
      this.logger.debug(`Transfer: Target wallet not found | cid: ${this.cid}`);
      // Create one
      return false;
    }
    if (this.amount < amount) {
      this.logger.debug(`Transfer: Not enough money | cid: ${this.cid}`);
      DGX.Util.Notify(src, `Je hebt niet genoeg ${this.cname} om ${amount}x over te maken!`, 'error');
      return false;
    }
    this.amount -= amount;
    await targetWallet.add(amount, `${src} transfer ${amount}x ${this.cname}`);
    global.exports['dg-logs'].createGraylogEntry(
      'financials:crypto:transfer',
      {
        cid: this.cid,
        target,
        coin: this.cname,
        amount,
        newTotal: this.amount - amount,
      },
      `Transferred crypto: ${amount}x ${this.cname} | cid: ${this.cid} | target: ${target}`
    );
    return true;
  }

  // endregion
}
