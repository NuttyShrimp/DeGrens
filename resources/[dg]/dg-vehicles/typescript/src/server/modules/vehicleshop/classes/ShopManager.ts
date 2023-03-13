import { Business, Config, Events, Notifications, Util } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/decorators';
import { getPlayerVehicleInfo, insertNewVehicle, setVehicleState } from 'db/repository';
import { spawnOwnedVehicle } from 'helpers/vehicle';
import plateManager from 'modules/identification/classes/platemanager';
import vinManager from 'modules/identification/classes/vinmanager';
import { decreaseModelStock, getConfigByModel, getModelStock, isInfoLoaded } from 'modules/info/service.info';
import { applyUpgradesToVeh, generateBaseUpgrades, saveCosmeticUpgrades } from 'modules/upgrades/service.upgrades';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

import { doVehicleShopTransaction, getVehicleTaxedPrice } from '../helpers.vehicleshop';
import { getVehicleShopConfig } from '../services/config.vehicleshop';

@RPCRegister()
@EventListener()
class ShopManager extends Util.Singleton<ShopManager>() {
  private readonly logger: winston.Logger;
  private readonly _playersInShop: Set<number>;
  private readonly spots: Map<number, VehicleShop.Spot>;
  // Key: spotId
  private readonly spotsForSale: Map<number, { model: string; customer: number; employee: number }>;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'VehicleShopManager' });
    this._playersInShop = new Set();
    this.spotsForSale = new Map();
    this.spots = new Map();
    this.loadSpotData();
  }

  //#region Getters/setters
  public get playersInShop() {
    return this._playersInShop;
  }
  //#endregion

  @RPCEvent('vehicles:shop:getCarSpots')
  private _getSpots = () => {
    return Object.fromEntries(shopManager.spots);
  };

  private loadSpotData = async () => {
    await Config.awaitConfigLoad();
    await Util.awaitCondition(() => isInfoLoaded(), 99999);
    const config = Config.getConfigValue<VehicleShop.Config>('vehicles.shop');
    this.spots.clear();
    config.carSpots.forEach((data, id) => {
      this.spots.set(id, { ...data, needsEmployee: this.isEmployeeNeeded(data.model) });
    });
  };

  @DGXEvent('vehicles:shop:setActive')
  public setPlayerActive = (plyId: number, active: boolean) => {
    if (!active) {
      this.playersInShop.delete(plyId);
      return;
    }
    this.playersInShop.add(plyId);
  };

  @DGXEvent('vehicles:shop:changeModel')
  private _changeSpotModel = (src: number, spotId: number, model: string) => {
    const spotData = this.spots.get(spotId);
    if (!spotData) {
      this.logger.error(`Tried to get data of invalid spot ${spotId}`);
      return;
    }
    const needsEmployee = this.isEmployeeNeeded(model);
    this.spots.set(spotId, { ...spotData, model, needsEmployee });
    this.playersInShop.forEach(ply => {
      Events.emitNet('vehicles:shop:changeModel', ply, spotId, model, needsEmployee);
    });
  };

  @RPCEvent('vehicles:shop:getPlayersInShop')
  private _getPlayersInShop = (): { label: string; plyId: number }[] => {
    return Array.from(this.playersInShop.values()).map(plyId => {
      const plyData = DGCore.Functions.GetPlayer(plyId)?.PlayerData;
      return {
        plyId,
        label: `${plyData?.charinfo?.firstname} ${plyData?.charinfo?.lastname} | ${plyData?.citizenid}`,
      };
    });
  };

  @DGXEvent('vehicles:shop:allowPlayerToBuy')
  private _allowPlayerToBuy = (employeeId: number, spotId: number, model: string, customerId: number) => {
    const employeeCid = Util.getCID(employeeId);
    const customerCid = Util.getCID(customerId);

    // Check if src has perms to do this action
    if (!Business.isPlyEmployed('pdm', employeeCid)) {
      Util.Log(
        'vehicleshop:noPermissions',
        { employeeCid, spotId, model, customerCid },
        `${Util.getName(employeeCid)} tried to allow player to buy vehicle but lacks permissions`,
        employeeId,
        true
      );
      this.logger.warn('Player tried to allow other player to buy vehicle at spot but lacks permissions');
      return;
    }

    if (this.spotsForSale.has(spotId)) {
      Notifications.add(employeeId, 'Het voertuig op deze plaats wordt momenteel al verkocht aan iemand', 'error');
      return;
    }

    if (getModelStock(model) <= 0) {
      Notifications.add(employeeId, 'Dit voertuig is niet op stock!', 'error');
      return;
    }

    this.spotsForSale.set(spotId, { model, customer: customerCid, employee: employeeCid });
    Util.Log(
      'vehicleshop:allowToBuy',
      { employeeCid, spotId, model, customerCid },
      `${Util.getName(employeeId)} allowed a player to buy vehicle ${model}`,
      employeeId
    );
    this.logger.info(
      `Player ${employeeCid} allowed a player (${customerCid}) to buy vehicle ${model} at spot ${spotId}`
    );

    const maxTime = getVehicleShopConfig().timeForSale;
    Notifications.add(customerId, `Je hebt ${maxTime / 60} minuten tijd om het voertuig te kopen`);
    Notifications.add(employeeId, `De persoon heeft ${maxTime / 60} minuten de tijd om het voertuig te kopen`);

    // After timeout we remove from forsalelist if the item is for the same player and same model as at the start
    // If a player buys the vehicle and employee allows another person then we gotta make sure it does not get deleted after the timeout
    setTimeout(() => {
      const spotData = this.spotsForSale.get(spotId);
      if (spotData?.customer !== customerCid || spotData?.model !== model) {
        this.logger.info('Not deleting forsalespot, because model or customer has changed during timeout');
        return;
      }
      Notifications.add(customerId, `Je tijd om het voertuig te kopen is verlopen!`);
      this.spotsForSale.delete(spotId);
    }, maxTime * 1000);
  };

  @RPCEvent('vehicles:shop:canPlayerBuy')
  public canPlayerBuyVehicle = (plyId: number, spotId: number, model: string) => {
    if (!this.isEmployeeNeeded(model)) return true;
    const data = this.spotsForSale.get(spotId);
    if (!data) return false;
    return data.customer === Util.getCID(plyId) && data.model === model;
  };

  private isEmployeeNeeded = (model: string) => {
    const modelClass = getConfigByModel(model)?.class;
    if (!modelClass) {
      this.logger.error(`Could not get config of model ${model}`);
      return true;
    }
    return getVehicleShopConfig().classesThatNeedEmployee.includes(modelClass);
  };

  @DGXEvent('vehicles:shop:buyVehicle')
  private _buyVehicle = async (src: number, spotId: number, model: string) => {
    const modelData = getConfigByModel(model);
    if (!modelData) {
      this.logger.error(`Could not get model data for ${model}`);
      return;
    }

    if (getModelStock(model) <= 0) {
      Notifications.add(src, 'Dit voertuig is niet op stock!', 'error');
      return;
    }

    const canBuy = shopManager.canPlayerBuyVehicle(src, spotId, model);
    if (!canBuy) {
      Notifications.add(src, 'Je hebt een werknemer nodig om dit voertuig te kopen', 'error');
      return;
    }

    const employeeCid =
      this.spotsForSale.get(spotId)?.employee ??
      Business.getBusinessOwner(getVehicleShopConfig().businessName)?.citizenid;
    if (!employeeCid) {
      Notifications.add(src, 'Er iets foutgelopen met de transactie', 'error');
      this.logger.error('Could not find business owner cid');
      Util.Log('vehicleshop:noOwner', {}, `Could not find business owner of pdm to sell vehicle`, undefined, true);
      return;
    }

    this.spotsForSale.delete(spotId);

    const transactionSuccesful = await doVehicleShopTransaction({
      customer: src,
      amount: modelData.price,
      comment: `Aankoop van ${modelData.brand} ${modelData.name} bij PDM`,
      taxId: getVehicleShopConfig().taxId,
    });
    if (!transactionSuccesful) {
      Notifications.add(src, 'Je hebt niet genoeg geld', 'error');
      return;
    }

    // Add vehicle to player vehicles
    const vin = vinManager.generateVin();
    const plate = plateManager.generatePlate();
    const cid = Util.getCID(src);
    await insertNewVehicle(vin, cid, model, plate);
    vinManager.addPlayerVin(vin);
    plateManager.addPlayerPlate(plate);
    const taxedPrice = getVehicleTaxedPrice(model);
    decreaseModelStock(model);
    Util.Log(
      'vehicleshop:boughtVehicle',
      { employeeCid, spotId, model, vin, plate, taxedPrice },
      `${Util.getName(src)} bought a vehicle (${model}) for ${taxedPrice}`,
      src
    );
    this.logger.info(`Player ${cid} bought a vehicle (${model}) for ${taxedPrice}`);
    Notifications.add(src, `Je ${modelData.brand} ${modelData.name} staat op je te wachten in de garage!`, 'success');

    // Check if any vehicle at spawnpos, if so alert player to check garage else spawn vehicle
    let spawnedVehicle = false;
    const spawnPosition = getVehicleShopConfig().vehicleSpawnLocation;
    let vehicle: number | undefined = undefined;
    if (!Util.isAnyVehicleInRange(spawnPosition, 4)) {
      const vehicleInfo = await getPlayerVehicleInfo(vin);
      vehicle = await spawnOwnedVehicle(src, vehicleInfo, spawnPosition);
      spawnedVehicle = vehicle !== undefined;
    }

    const upgrades = generateBaseUpgrades(vehicle);
    if (spawnedVehicle && vehicle !== undefined) {
      await setVehicleState(vin, 'out');
      applyUpgradesToVeh(NetworkGetNetworkIdFromEntity(vehicle), upgrades);
    } else {
      Notifications.add(src, 'Kon je voertuig niet uithalen. Bekijk de Vehiclesapp om je voertuig te vinden', 'error');
    }
    saveCosmeticUpgrades(vin, upgrades);
  };

  public getModelAtSpot = (spotId: number) => {
    return this.spots.get(spotId)?.model;
  };
}

const shopManager = ShopManager.getInstance();
export default shopManager;