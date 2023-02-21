import { Financials, SQL, TaxIds, Util } from '@dgx/server';
import { getPlayerOwnedVehicles } from 'db/repository';
import { getConfigByModel } from 'modules/info/service.info';
import { mainLogger } from 'sv_logger';

const generateFees = (cids: number[]) => {
  cids.forEach(async cid => {
    // Prevent that overheids voertuigen niet meer zouden uithaalbaar zijn
    if (cid == 1000) return;
    let vehicles = await getPlayerOwnedVehicles(cid);
    // No fees on bicycles
    vehicles = vehicles.filter(veh => {
      const vehConfig = getConfigByModel(veh.model);
      if (!vehConfig) {
        mainLogger.error(`Failed to give maintenace fee to ${cid} because ${veh.model} has no config`);
        return false;
      }
      return vehConfig.category !== 'cycles';
    });
    let taxInfo = Financials.getTaxInfo(TaxIds.MaintenanceFee);
    const vehMultiplier = vehicles.length > 2 ? 1 + vehicles.length * 0.04 : 1;
    vehicles.forEach(async veh => {
      // Check if a fee already exist:
      const vehMainFees = await SQL.query<Financials.Debts.Debt[]>('SELECT * FROM debts WHERE reason = ?', [
        `veh_${veh.vin}`,
      ]);
      if (vehMainFees.length > 0) {
        global.exports['dg-financials'].removeDebt(vehMainFees.map(f => f.id));
      }
      const vehConfig = getConfigByModel(veh.model)!;

      const baseRate = taxInfo?.rate ?? 0.15;

      const minDebtPrice = Math.round(vehConfig.price * (baseRate - 0.01) * vehMultiplier);
      console.log(minDebtPrice);
      const maxDebtPrice = Math.round(vehConfig.price * (baseRate + 0.01) * vehMultiplier);
      console.log(maxDebtPrice);
      const debtPrice = Util.getRndInteger(minDebtPrice, maxDebtPrice);
      // Little abuse of origin-name right here
      global.exports['dg-financials'].addMaintentenanceFee(
        cid,
        'BE1',
        debtPrice,
        `veh_${veh.vin}`,
        `${vehConfig.brand} ${vehConfig.name} (${veh.plate})`
      );
    });
  });
};

global.exports('generateFees', generateFees);
