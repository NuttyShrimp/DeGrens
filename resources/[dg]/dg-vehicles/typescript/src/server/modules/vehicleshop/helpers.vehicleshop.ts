import { Business, Financials, Util } from '@dgx/server';
import { getConfigByModel, getModelStock } from 'modules/info/service.info';

import { getVehicleShopConfig } from './services/config.vehicleshop';
import { vehicleshopLogger } from './logger.vehicleshop';
import { ModelCategorisation, VEHICLE_CATEGORY_TO_LABEL } from './constants.vehicleshop';

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

export const doVehicleShopTransaction = async (transaction: {
  customer: number;
  amount: number;
  comment: string;
  taxId?: number;
}): Promise<boolean> => {
  // Get the business data
  const shopBusinessName = getVehicleShopConfig().businessName;
  const shopBusiness = Business.getBusinessByName(shopBusinessName);
  if (!shopBusiness) return false;

  const customerCid = Util.getCID(transaction.customer);

  // Bank account of customer
  const customerBankAccount = Financials.getDefaultAccountId(customerCid);
  const shopBankAccount = shopBusiness.info.bank_account_id;
  if (!customerBankAccount || !shopBankAccount) return false;

  // Do payment
  const transactionSuccesful = await Financials.transfer(
    customerBankAccount,
    shopBankAccount,
    customerCid,
    customerCid,
    transaction.amount,
    transaction.comment,
    transaction.taxId
  );
  return transactionSuccesful;
};

export const getCategoryLabel = (categorisation: ModelCategorisation, category: Category) => {
  switch (categorisation) {
    case 'brand':
      return category;
    case 'category':
      return VEHICLE_CATEGORY_TO_LABEL[category] ?? 'Geen Category';
    case 'class':
      return `Klasse: ${category}`;
  }
};

export const buildVehicleContextMenuEntry = (vehicle: Config.CarSchema): ContextMenu.Entry => {
  const stock = getModelStock(vehicle.model);
  return {
    title: `${vehicle.brand} ${vehicle.name}`,
    description: `Prijs: €${getVehicleTaxedPrice(vehicle.model)} incl. BTW | Klasse: ${
      vehicle.class
    } | Voorraad: ${stock}`,
    callbackURL: 'vehicleshop/selectModel',
    data: {
      model: vehicle.model,
    },
    preventCloseOnClick: true,
  };
};
