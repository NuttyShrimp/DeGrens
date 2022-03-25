import { deposit, mobile_transaction, paycheck, purchase, transfer, withdraw } from '../helpers/actions';
import { bankLogger } from '../utils';

global.exports('deposit', deposit);
global.exports('withdraw', withdraw);
global.exports('transfer', transfer);
global.exports('purchase', purchase);
global.exports('paycheck', paycheck);
global.exports('mobile_transaction', mobile_transaction);

DGCore.Functions.CreateCallback('financials:server:action:deposit', async (src, cb, data: ActionData.Standard) => {
  bankLogger.silly(
    `Deposit by ${src}: accountId: ${data.accountId} | amount: ${data.amount} | comment: ${data.comment}`
  );
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.error(`Mo Player found for ${src}`);
    return;
  }
  await deposit(data.accountId, Player.PlayerData.citizenid, data.amount, data.comment);
  cb();
});

DGCore.Functions.CreateCallback('financials:server:action:withdraw', async (src, cb, data: ActionData.Standard) => {
  bankLogger.silly(
    `Withdraw by ${src}: accountId: ${data.accountId} | amount: ${data.amount} | comment: ${data.comment}`
  );
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.error(`Mo Player found for ${src}`);
    return;
  }
  await withdraw(data.accountId, Player.PlayerData.citizenid, data.amount, data.comment);
  cb();
});

DGCore.Functions.CreateCallback('financials:server:action:transfer', async (src, cb, data: ActionData.Transfer) => {
  bankLogger.silly(
    `Transfer by ${src}; accountId: ${data.accountId} | TargetAccount: ${data.target} | amount: ${data.amount} | comment: ${data.comment}`
  );
  const Player = DGCore.Functions.GetPlayer(src);
  if (!Player) {
    bankLogger.error(`Mo Player found for ${src}`);
    return;
  }
  const citizenid = Player.PlayerData.citizenid;
  const isSuccess = await transfer(data.accountId, data.target, citizenid, citizenid, data.amount, data.comment);
  bankLogger.silly(`Transfer: ${isSuccess}`);
  cb(isSuccess);
});
DGCore.Functions.CreateCallback(
  'financials:server:action:mobileTransaction',
  async (src, cb, data: ActionData.Transfer) => {
    bankLogger.silly(
      `Mobile Transaction by ${src}; accountId: ${data.accountId} | TargetPhone: ${data.target} | amount: ${data.amount} | comment: ${data.comment}`
    );
    const Player = DGCore.Functions.GetPlayer(src);
    if (!Player) {
      bankLogger.error(`Mo Player found for ${src}`);
      return;
    }
    const citizenid = Player.PlayerData.citizenid;
    const isSuccess = await mobile_transaction(data.accountId, citizenid, data.target, data.amount, data.comment);
    bankLogger.silly(`Mobile Transaction: ${isSuccess}`);
    cb(isSuccess);
  }
);
