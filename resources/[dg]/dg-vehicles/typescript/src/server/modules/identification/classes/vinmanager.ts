import { SQL, Util } from '@dgx/server';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import winston from 'winston';

import { idLogger } from '../logger.id';

// vin-code is length 17

@ExportRegister()
class VinManager extends Util.Singleton<VinManager>() {
  private registeredVins: Set<string>;
  private playerVins: Set<string>;
  // Map of vin to veh net id
  private vinToNetId: Map<string, number> = new Map();
  private logger: winston.Logger;

  constructor() {
    super();
    this.registeredVins = new Set();
    this.playerVins = new Set();

    this.logger = idLogger.child({
      module: 'VinManager',
    });
  }

  async fetchVins() {
    const query = 'SELECT vin from player_vehicles';
    const result = await SQL.query<{ vin: string }[]>(query);
    for (const row of result) {
      this.playerVins.add(row.vin);
    }
    this.logger.debug(`Registered ${this.playerVins.size} vins`);
  }

  doesVinExist(vin: string): boolean {
    return this.registeredVins.has(vin) || this.playerVins.has(vin);
  }

  doesVinMatch(vin: string, vehNetId: number): boolean {
    if (!this.doesVinExist(vin) || !this.vinToNetId.has(vin)) {
      return false;
    }
    return this.vinToNetId.get(vin) === vehNetId;
  }

  @Export('isVinFromPlayerVeh')
  isVinFromPlayerVeh(vin: string) {
    this.logger.silly(`${vin} is ${this.playerVins.has(vin) ? '' : 'not '}a playervin`);
    return this.playerVins.has(vin);
  }

  attachVinToNetId(vin: string, vehId: number) {
    this.logger.debug(`Attaching vin ${vin} to veh id ${vehId}`);
    const veh = NetworkGetEntityFromNetworkId(vehId);
    if (!veh) {
      throw new Error(`Failed to set vin ${vin} to veh id ${vehId} - entity not found`);
    }
    this.registeredVins.add(vin);
    this.vinToNetId.set(vin, vehId);
  }

  @Export('getNetIdOfVin')
  getNetId(vin: string): number | null {
    const netId = this.vinToNetId.get(vin);
    if (!netId) return null;

    const veh = NetworkGetEntityFromNetworkId(netId);
    if (!DoesEntityExist(veh) || !Entity(veh).state?.vin) {
      this.logger.debug(`Deleting registered vin ${vin} because entity does not exist anymore`);
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
      this.registeredVins.add(vin);
      this.vinToNetId.set(vin, netId);
    }
    return vin;
  }

  // Use when you add new player owned vehicle in script (Buying new veh for example)
  addPlayerVin(vin: string) {
    this.playerVins.add(vin);
  }
}

const vinManager = VinManager.getInstance();
export default vinManager;
