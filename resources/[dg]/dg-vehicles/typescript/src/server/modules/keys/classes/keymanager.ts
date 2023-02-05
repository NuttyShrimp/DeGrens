import { Events, Util } from '@dgx/server';
import { setEngineState } from 'helpers/vehicle';
import winston from 'winston';

import vinManager from '../../identification/classes/vinmanager';
import { keyLogger } from '../logger.keys';

class KeyManager extends Util.Singleton<KeyManager>() {
  /**
   * Map with vin as key and an array of cids as value
   * @private
   */
  private keys: Map<string, number[]>;
  private logger: winston.Logger;

  constructor() {
    super();
    this.keys = new Map();
    this.logger = keyLogger.child({
      module: 'KeyManager',
    });
  }

  /**
   * Adds a key to the map
   * @param pVin
   * @param source
   */
  public addKey(pVin: string, source: number): void {
    const cid = Player(source).state.cid;
    if (!this.keys.has(pVin)) {
      this.logger.debug(`addKey: Adding ${pVin} to map | CID: ${cid}`);
      this.keys.set(pVin, []);
    }
    const cids = this.keys.get(pVin)!;
    if (cids.indexOf(cid) === -1) {
      this.logger.debug(`addKey: Adding CID ${cid} as keyholder for ${pVin}`);
      cids.push(cid);
      Events.emitNet('vehicles:keys:addToCache', source, pVin);
    }
    this.keys.set(pVin, cids);

    // If driver then start engine
    const netId = vinManager.getNetId(pVin);
    if (!netId) return;
    const veh = NetworkGetEntityFromNetworkId(netId);
    if (!veh || GetPedInVehicleSeat(veh, -1) !== GetPlayerPed(String(source))) return;
    setEngineState(veh, true);
  }

  /**
   * Checks if a player has a key for a plate
   * @param pVin
   * @param src
   * @returns True if the player has a key for the plate
   */
  public hasKey(pVin: string, src: number): boolean {
    const cid = Player(src).state.cid;
    if (!this.keys.has(pVin)) {
      this.logger.debug(`hasKey: No key for vin ${pVin} | CID: ${cid}`);
      return false;
    }
    const cids = this.keys.get(pVin) ?? [];
    const hasKey = cids.indexOf(cid) !== -1;
    this.logger.debug(`hasKey: ${hasKey} | vin: ${pVin} | CID: ${cid}`);
    return hasKey;
  }

  /**
   * Get an array of vins player has keys of
   * @param plyId
   */
  public getAllPlayerKeys = (plyId: number) => {
    const cid = Util.getCID(plyId);
    const vins: string[] = [];
    this.keys.forEach((cids, vin) => {
      if (!cids.includes(cid)) return;
      vins.push(vin);
    });
    return vins;
  };

  /**
   * Removes a key from the map
   * @param pVin
   * @param src
   */
  public removeKey(pVin: string, src: number): void {
    const cid = Player(src).state.cid;
    if (!this.keys.has(pVin)) {
      return;
    }
    const cids = this.keys.get(pVin) ?? [];
    const index = cids.indexOf(cid);
    if (index !== -1) {
      this.logger.debug(`removeKey: Removing ${cid} key from ${pVin}`);
      cids.splice(index, 1);
      Events.emitNet('vehicles:keys:removeFromCache', source, pVin);
    }
    if (cids.length === 0) {
      this.keys.delete(pVin);
      return;
    }
    this.keys.set(pVin, cids);
  }

  public removeKeys(pVin: string): void {
    const keys = this.keys.get(pVin);
    if (!keys) {
      return;
    }
    this.logger.debug(`Removing all car keys for ${pVin}`);
    keys.forEach(cid => {
      const plyId = DGCore.Functions.getPlyIdForCid(cid);
      if (!plyId) return;
      Events.emitNet('vehicles:keys:removeFromCache', plyId, pVin);
    });
    this.keys.delete(pVin);
  }
}

export const keyManager = KeyManager.getInstance();
