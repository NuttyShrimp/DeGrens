import { Business, Financials, Util } from '@dgx/server';
import { getConfigByModel } from 'modules/info/service.info';

import { getVehicleShopConfig } from './services/config.vehicleshop';
import { vehicleshopLogger } from './logger.vehicleshop';

export const getVehicleTaxedPrice = (model: string) => {
  const modelData = getConfigByModel(model);
  if (!modelData) {
    vehicleshopLogger.error(`Could not get model data for ${model}`);
    return;
  }
  const taxId = getVehicleShopConfig().taxId;
  const tax = Financials.getTaxedPrice(modelData.price, taxId);
  return tax.taxPrice;
};

export const getTestDriveDeposit = (model: string) => {
  const modelData = getConfigByModel(model);
  if (!modelData) {
    vehicleshopLogger.error(`Could not get model data for ${model}`);
    return;
  }
  const deposit = modelData.price * getVehicleShopConfig().testDrive.depositPercentage;
  return Math.round(deposit);
};

export const doVehicleShopTransaction = async (
  transaction: {
    customer: number;
    amount: number;
    comment: string;
    taxId?: number;
  },
  toCustomer = false
): Promise<boolean> => {
  // Get the business data
  const shopBusinessName = getVehicleShopConfig().businessName;
  const shopBusiness = Business.getBusinessByName(shopBusinessName);
  if (!shopBusiness) return false;

  // Get cid of customer and employee (defaults to owner)
  const customerCid = Util.getCID(transaction.customer);
  const shopOwnerCid = shopBusiness.employees.find(e => e.isOwner)?.citizenid;
  if (!customerCid || !shopOwnerCid) return false;

  // Bank account of customer
  const customerBankAccount = Financials.getDefaultAccountId(customerCid);
  const shopBankAccount = shopBusiness.info.bank_account_id;
  if (!customerBankAccount || !shopBankAccount) return false;

  // Do payment
  let transactionSuccesful = false;
  if (toCustomer) {
    transactionSuccesful = await Financials.transfer(
      shopBankAccount,
      customerBankAccount,
      shopOwnerCid,
      customerCid,
      transaction.amount,
      transaction.comment,
      transaction.taxId
    );
  } else {
    transactionSuccesful = await Financials.transfer(
      customerBankAccount,
      shopBankAccount,
      customerCid,
      shopOwnerCid,
      transaction.amount,
      transaction.comment,
      transaction.taxId
    );
  }
  return transactionSuccesful;
};
