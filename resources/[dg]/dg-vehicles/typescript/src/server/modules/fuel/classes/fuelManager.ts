import { ExportDecorators, SQL, Util } from '@dgx/server';
import { getVinForVeh } from 'helpers/vehicle';
import vinManager from '../../identification/classes/vinmanager';
import { fuelLogger } from '../logger.fuel';

const { Export, ExportRegister } = ExportDecorators<'vehicles'>();

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
    this.saveFuel(vehicle, fuelLevel);
  }

  saveFuel(vehicle: number, amount?: number) {
    const vin = getVinForVeh(vehicle);
    if (!vin || !vinManager.isVinFromPlayerVeh(vin)) return;
    const fuelLevel = amount ?? this.getFuelLevel(vehicle);
    this.updateFuelDB(vin, fuelLevel);
  }

  // Register new vehicles that dont have fuel registered yet
  registerVehicle(vehicle: number, amount?: number) {
    const fuelLevel = amount ?? Util.getRndInteger(40, 81);
    this.setFuelLevel(vehicle, fuelLevel);
    fuelLogger.debug(`Registering ${vehicle} with ${fuelLevel}% in tank`);
  }
}

export const fuelManager = FuelManager.getInstance();
