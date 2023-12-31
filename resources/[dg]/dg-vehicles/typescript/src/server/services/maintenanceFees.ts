import { Financials, TaxIds } from '@dgx/server';
import { getPlayerOwnedVehicles } from 'db/repository';
import { getConfigByModel } from 'modules/info/service.info';
import { mainLogger } from 'sv_logger';

const generateFees = async (cids: number[]) => {
  const fees: IFinancials.MaintenanceFee[] = [];
  const taxInfo = Financials.getTaxInfo(TaxIds.MaintenanceFee);
  const baseRate = taxInfo?.rate ?? 0.15;
  mainLogger.info(`Vehicle calculation fee with rate of ${baseRate}`);
  for (const cid of cids) {
    // Prevent that overheids voertuigen niet meer zouden uithaalbaar zijn
    if (cid == 1000) continue;
    let vehicles = await getPlayerOwnedVehicles(cid);

    // No fees on bicycles or vinscratches
    vehicles = vehicles.filter(veh => {
      if (veh.vinscratched) return false;
      const vehConfig = getConfigByModel(veh.model);
      if (!vehConfig) {
        mainLogger.error(`Failed to give maintenace fee to ${cid} because ${veh.model} has no config`);
        return false;
      }
      return vehConfig.category !== 'cycles';
    });

    const vehMultiplier = vehicles.length > 2 ? 1 + (vehicles.length * Math.log10(vehicles.length) * 2) / 100 : 1;

    for (const veh of vehicles) {
      const vehConfig = getConfigByModel(veh.model)!;
      const debtPrice = vehConfig.price * baseRate * vehMultiplier;
      // Little abuse of origin-name right here
      fees.push({
        cid,
        target_account: 'BE1',
        debt: debtPrice,
        reason: `veh_${veh.vin}`,
        origin: `${vehConfig.brand} ${vehConfig.name} (${veh.plate})`,
      });
    }
  }
  return fees;
};

global.asyncExports('generateFees', generateFees);
