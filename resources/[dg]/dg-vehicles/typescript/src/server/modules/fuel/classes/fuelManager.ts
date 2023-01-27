import { Events, SQL, Util } from '@dgx/server';
import { Export, ExportRegister } from '@dgx/shared';

import vinManager from '../../identification/classes/vinmanager';
import { fuelLogger } from '../logger.fuel';

@ExportRegister()
class FuelManager extends Util.Singleton<FuelManager>() {
  // Map of vin to fuel level
  private fuelMap: Map<string, number> = new Map();

  private async updateFuelDB(vin: string, fuelLevel: number) {
    const query = `UPDATE vehicle_status SET fuel = ? WHERE vin = ? `;
    const params = [fuelLevel, vin];
    const result = await SQL.query(query, params);
    if (result.affectedRows === 0) {
      fuelLogger.error(`Failed to update fuel level for vin ${vin}`);
    }
  }

  getFuelLevel(vin: string): number | undefined {
    return this.fuelMap.get(vin);
  }

  @Export('setFuelLevel')
  setFuelLevel(vin: string, fuelLevel: number): void {
    fuelLogger.silly(`Setting fuel for ${vin} to ${fuelLevel}`);
    this.fuelMap.set(vin, fuelLevel);
    if (vinManager.isVinFromPlayerVeh(vin)) {
      this.updateFuelDB(vin, fuelLevel);
    }
    // This will set the fuel level for the players in the vehicle matching the vin
    const netId = vinManager.getNetId(vin);
    if (netId) {
      const veh = NetworkGetEntityFromNetworkId(netId);
      Util.getPlayersInVehicle(veh).forEach(ply => Events.emitNet('vehicles:fuel:set', ply, fuelLevel));
    }
  }
  registerVehicle(vin: string) {
    if (this.fuelMap.has(vin)) {
      return;
    }
    const fuelLevel = Util.getRndInteger(20, 81);
    fuelLogger.debug(`Registering ${vin} with ${fuelLevel}% in tank`);
    this.fuelMap.set(vin, fuelLevel);
  }
  removeVehicle(vin: string) {
    this.fuelMap.delete(vin);
  }
}

export const fuelManager = FuelManager.getInstance();
