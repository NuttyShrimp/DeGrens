import { SQL, Util } from '@dgx/server';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import winston from 'winston';

import { idLogger } from '../logger.id';

// vin-code is length 17

@ExportRegister()
class VinManager extends Util.Singleton<VinManager>() {
  private registeredVins: string[] = [];
  private playerVins: string[] = [];
  // Map of vin to veh net id
  private vinToNetId: Map<string, number> = new Map();
  private logger: winston.Logger;

  constructor() {
    super();
    this.logger = idLogger.child({
      module: 'VinManager',
    });
  }

  async fetchVins() {
    const query = 'SELECT vin from player_vehicles';
    const result = await SQL.query(query);
    this.playerVins = result.map((row: { vin: string }) => row.vin);
    this.logger.debug(`Registered ${this.playerVins.length} vins`);
  }

  doesVinExist(vin: string): boolean {
    return this.registeredVins.includes(vin) || this.playerVins.includes(vin);
  }

  doesVinMatch(vin: string, vehNetId: number): boolean {
    if (!this.doesVinExist(vin) || !this.vinToNetId.has(vin)) {
      return false;
    }
    return this.vinToNetId.get(vin) === vehNetId;
  }

  @Export('isVinFromPlayerVeh')
  isVinFromPlayerVeh(vin: string) {
    this.logger.silly(`${vin} is ${this.playerVins.includes(vin) ? '' : 'not '}a playervin`);
    return this.playerVins.includes(vin);
  }

  attachVinToNetId(vin: string, vehId: number) {
    this.logger.debug(`Attaching vin ${vin} to veh id ${vehId}`);
    const veh = NetworkGetEntityFromNetworkId(vehId);
    if (!veh) {
      throw new Error(`Failed to set vin ${vin} to veh id ${vehId} - entity not found`);
    }
    if (!this.registeredVins.includes(vin)) {
      this.registeredVins.push(vin);
    }
    this.vinToNetId.set(vin, vehId);
  }

  @Export('getNetIdOfVin')
  getNetId(vin: string): number | null {
    const netId = this.vinToNetId.get(vin);
    if (!netId) return null;
    const veh = NetworkGetEntityFromNetworkId(netId);
    if (!Entity(veh).state?.vin) {
      this.vinToNetId.delete(vin);
      return null;
    }
    return netId;
  }

  generateVin(netId?: number): string {
    let vin = Util.generateRndChar(17).toUpperCase();
    while (this.doesVinExist(vin)) {
      vin = Util.generateRndChar(17).toUpperCase();
    }
    if (netId) {
      this.logger.debug(`Generated vin ${vin} for netId ${netId}`);
      this.registeredVins.push(vin);
      this.vinToNetId.set(vin, netId);
    }
    return vin;
  }

  addPlayerVin(vin: string) {
    this.playerVins.push(vin);
  }
}

const vinManager = VinManager.getInstance();
export default vinManager;
