import { SQL, Util } from '@dgx/server';
import { Export, ExportRegister } from '@dgx/shared';

import vinManager from '../../identification/classes/vinmanager';
import { fuelLogger } from '../logger.fuel';
import { getVinForVeh } from 'helpers/vehicle';

@ExportRegister()
class FuelManager extends Util.Singleton<FuelManager>() {
  private async updateFuelDB(vin: string, fuelLevel: number) {
    const query = `UPDATE vehicle_status SET fuel = ? WHERE vin = ? `;
    const result = await SQL.query(query, [fuelLevel, vin]);
    if (result.affectedRows === 0) {
      fuelLogger.error(`Failed to update fuel level for vin ${vin}`);
    }
  }

  getFuelLevel(vehicle: number): number {
    const fuelLevel = Entity(vehicle).state?.fuelLevel ?? 0;
    fuelLogger.debug(`Getting fuelLevel for ${vehicle}: ${fuelLevel}`);
    return fuelLevel;
  }

  @Export('setFuelLevel')
  setFuelLevel(vehicle: number, fuelLevel: number): void {
    fuelLogger.silly(`Setting fuel for ${vehicle} to ${fuelLevel}`);
    Entity(vehicle).state.fuelLevel = fuelLevel;
  }

  // Fired when fuelLevel statebag of a vehicle has changed
  public handleStateChange = (vehicle: number, fuelLevel: number) => {
    const vin = getVinForVeh(vehicle);
    if (!vin || !vinManager.isVinFromPlayerVeh(vin)) return;
    this.updateFuelDB(vin, fuelLevel);
  };

  // Register new vehicles that dont have fuel registered yet
  registerVehicle(vehicle: number, amount?: number) {
    const fuelLevel = amount ?? Util.getRndInteger(40, 81);
    this.setFuelLevel(vehicle, fuelLevel);
    fuelLogger.debug(`Registering ${vehicle} with ${fuelLevel}% in tank`);
  }
}

export const fuelManager = FuelManager.getInstance();
