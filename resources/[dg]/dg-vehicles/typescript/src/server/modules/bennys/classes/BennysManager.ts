import { Financials, TaxIds, Util } from '@dgx/server';
import { DGXEvent, EventListener, ExportDecorators, LocalEvent, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { getVinForVeh } from 'helpers/vehicle';
import vinManager from 'modules/identification/classes/vinmanager';
import { getConfigByEntity } from 'modules/info/service.info';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';
import { saveCosmeticUpgrades } from 'modules/upgrades/service.upgrades';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import { handleStanceOnCosmeticChange, loadStance } from 'modules/stances/service.stances';

const { ExportRegister, Export } = ExportDecorators<'vehicles'>();

@RPCRegister()
@EventListener()
@ExportRegister()
class BennysManager extends Util.Singleton<BennysManager>() {
  private logger: winston.Logger;
  private spotData: Map<string, Bennys.SpotData>;
  private noChargeSpots: Set<string>; // For admin menu
  private blockedVins: Set<string>; // vins which cant enter a bennys

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'BennysManager' });
    this.spotData = new Map();
    this.noChargeSpots = new Set();
    this.blockedVins = new Set();
  }

  private isSpotFromPlayer = (spotId: string, playerId: number) => this.spotData.get(spotId)?.player === playerId;

  public getSpotData = (spotId: string) => this.spotData.get(spotId);

  private getSpotByPlyId = (plyId: number) => {
    for (const [spotId, data] of this.spotData) {
      if (data.player === plyId) return spotId;
    }
  };

  private getSpotByVehicle = (vehicle: number) => {
    for (const [spotId, data] of this.spotData) {
      if (data.entity === vehicle) return spotId;
    }
  };

  @RPCEvent('vehicles:bennys:isSpotFree')
  private _isSpotFree = (plyId: number, spotId: string) => {
    const spot = this.spotData.get(spotId);
    if (spot === undefined) return true;

    const netId = vinManager.getNetId(spot.vin);
    if (!netId) {
      this.spotData.delete(spotId);
      this.noChargeSpots.delete(spotId);
      this.logger.warn(`Could not find netId of veh (${spot.vin}). Spot has been cleared`);
      return true;
    }

    if (!DoesEntityExist(spot.entity)) {
      this.spotData.delete(spotId);
      this.noChargeSpots.delete(spotId);
      this.logger.warn(`Vehicle entity (${spot.vin}) does not exist. Spot has been cleared`);
      return true;
    }

    return false;
  };

  @RPCEvent('vehicles:bennys:enterSpot')
  private _enterSpot = (
    plyId: number,
    spotId: string,
    vehNetId: number,
    upgrades: Vehicles.Upgrades.Cosmetic.Upgrades,
    repair: Bennys.RepairInfo,
    originalStance: Stances.Stance
  ) => {
    const veh = NetworkGetEntityFromNetworkId(vehNetId);
    if (!veh || !DoesEntityExist(veh)) {
      this.logger.error(`${Util.getName(plyId)} tried to enter bennys with an non-existing vehicle`);
      return false;
    }
    if (this.spotData.has(spotId)) return false;
    const vin = getVinForVeh(veh);
    if (!vin) {
      this.logger.error(`${Util.getName(plyId)} tried to enter bennys with a vehicle with no vin`);
      return false;
    }
    if (this.blockedVins.has(vin)) {
      this.logger.silly(`${Util.getName(plyId)} tried to enter bennys with a blocked vin`);
      return false;
    }
    this.spotData.set(spotId, {
      player: plyId,
      vin,
      entity: veh,
      upgrades,
      repair,
      originalStance,
    });
    Util.Log(
      'bennys:entered',
      {
        vin,
        spotId,
      },
      `${Util.getName(plyId)} has entered a bennys`,
      plyId
    );
    return true;
  };

  @DGXEvent('vehicles:bennys:leaveSpot')
  private _leaveSpot = (plyId: number, spotId: string) => {
    if (!this.spotData.has(spotId)) return;
    if (!this.isSpotFromPlayer(spotId, plyId)) return;
    this.spotData.delete(spotId);
    this.noChargeSpots.delete(spotId);
  };

  @DGXEvent('vehicles:bennys:resetVehicle')
  private resetVehicle = (_: number, spotId: string, timeout = 0) => {
    const spotData = this.spotData.get(spotId);
    if (!spotData) {
      this.logger.warn(`Could not get data of spot ${spotId} for resetting vehicle`);
      return;
    }

    // for some reason when ply drops, he will still be owner when this function executes so reset will not happen
    setTimeout(
      () => {
        loadStance({
          vin: spotData.vin,
          vehicle: spotData.entity,
          checkOverrideStance: true,
          upgrades: spotData.upgrades,
          original: spotData.originalStance,
        });
        upgradesManager.apply(spotData.entity, spotData.upgrades);
      },
      timeout ? 2000 : 0
    );

    this.logger.info(`Vehicle at bennys (${spotId}) has been reset to original upgrades`);
  };

  @DGXEvent('vehicles:bennys:buyUpgrades')
  private _buyUpgrades = async (
    plyId: number,
    spotId: string,
    cart: { component: keyof Vehicles.Upgrades.Cosmetic.Upgrades; data: any }[]
  ) => {
    const spotData = this.spotData.get(spotId);
    if (!spotData) {
      this.logger.warn(`Could not get data of spot ${spotId} for buying upgrades`);
      return;
    }
    if (!this.isSpotFromPlayer(spotId, plyId)) return;

    const upgrades: Partial<Vehicles.Upgrades.Cosmetic.Upgrades> = {};
    cart.forEach(({ component, data }) => {
      if (component.startsWith('extra_')) {
        if (!upgrades.extras) upgrades.extras = [];
        upgrades.extras.push(data);
      } else {
        upgrades[component] = data;
      }
    });

    let price = 0;
    const isNoChargeSpot = this.noChargeSpots.has(spotId);
    if (!isNoChargeSpot) {
      const carClass = getConfigByEntity(spotData.entity)?.class ?? 'D';
      price = upgradesManager.calculatePriceForUpgrades(carClass, upgrades);
      const plyCid = Util.getCID(plyId);
      const plyAccountId = Financials.getDefaultAccountId(plyCid);
      let purchaseSuccess = false;
      if (plyAccountId !== undefined) {
        purchaseSuccess = await Financials.purchase(
          plyAccountId,
          plyCid,
          price,
          `Aankoop tuningonderdelen in Benny's voor voertuig (${spotData.vin})`,
          TaxIds.Goederen
        );
      }
      if (!purchaseSuccess) {
        this.resetVehicle(plyId, spotId);
        return;
      }
    }

    if (vinManager.isVinFromPlayerVeh(spotData.vin)) {
      saveCosmeticUpgrades(spotData.vin, upgrades);
      upgradesManager.apply(spotData.entity, upgrades);
      handleStanceOnCosmeticChange(spotData.vin, spotData.entity, upgrades);
    }

    Util.Log(
      'bennys:purchaseUpgrades',
      {
        vin: spotData.vin,
        price: price,
        upgrades,
        isNoChargeSpot,
      },
      `${Util.getName(plyId)} has purchased upgrades for vehicle (${spotData.vin})`,
      plyId
    );
  };

  @RPCEvent('vehicles:bennys:getRepairTimes')
  private getRepairTimes = (plyId: number, spotId: string) => {
    const repairData = this.spotData.get(spotId)?.repair;
    if (!repairData) {
      this.logger.warn(`Could not get data of spot ${spotId} for getting repair times`);
      return;
    }
    const maxTimePerRepair = 35000 / 2;
    return {
      body: maxTimePerRepair * (1 - repairData.body / 1000),
      engine: maxTimePerRepair * (1 - repairData.engine / 1000),
    };
  };

  public playerDropped = (plyId: number) => {
    const spotId = this.getSpotByPlyId(plyId);
    if (!spotId) return;
    this.resetVehicle(plyId, spotId, 2000);
    this.spotData.delete(spotId);
    this.noChargeSpots.delete(spotId);
    this.logger.info(`Player in bennys ${spotId} has left. Spot has been cleared`);
  };

  @RPCEvent('vehicles:bennys:payForRepair')
  private payForRepair = (plyId: number, spotId: string) => {
    if (!this.spotData.has(spotId)) {
      this.logger.warn(`Could not get data of spot ${spotId} for repairpayment`);
      return;
    }
    if (this.noChargeSpots.has(spotId)) return true;
    const price = this.spotData.get(spotId)?.repair?.price ?? 0;
    const paid = Financials.removeCash(plyId, price, 'bennys-repair');
    return paid;
  };

  // Do not expose to client side, only gets used in admin panel from serverside command
  @LocalEvent('vehicles:bennys:registerNoChargeSpot')
  private _registerNoChargeSpot = (plyId: number) => {
    const cid = Util.getCID(plyId);
    const spotId = `bennys_admin_${cid}`;
    this.noChargeSpots.add(spotId);
    this.logger.info(`Spot got registered as free by ${cid}`);
    Util.Log(
      'bennys:registerNoCharge',
      {
        spotId,
        cid,
      },
      `${Util.getName(plyId)} has registered a spot to be free`,
      plyId
    );
  };

  public isNoChargeSpot = (spotId: string) => {
    return this.noChargeSpots.has(spotId);
  };

  @Export('blockVinInBennys')
  private blockVinInBennys(vin: string) {
    this.blockedVins.add(vin);
  }
}

const bennysManager = BennysManager.getInstance();
export default bennysManager;
