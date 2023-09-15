import { Business, Config, Events, Inventory, Notifications, Util, UI, Core } from '@dgx/server';
import { DGXEvent, EventListener, RPCEvent, RPCRegister } from '@dgx/server/src/decorators';
import { getPlayerVehicleInfo, insertNewVehicle, setVehicleState } from 'db/repository';
import { spawnOwnedVehicle } from 'helpers/vehicle';
import plateManager from 'modules/identification/classes/platemanager';
import vinManager from 'modules/identification/classes/vinmanager';
import { decreaseModelStock, getConfigByModel, getModelStock, isInfoLoaded } from 'modules/info/service.info';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { doVehicleShopTransaction, getVehicleTaxedPrice } from '../helpers.vehicleshop';
import { getVehicleShopConfig } from '../services/config.vehicleshop';
import { charModule } from 'helpers/core';

@RPCRegister()
@EventListener()
class ShopManager extends Util.Singleton<ShopManager>() {
  private readonly logger: winston.Logger;
  private readonly _playersInShop: Set<number>;
  private readonly spots: Map<number, VehicleShop.Spot>;
  // Key: spotId
  private readonly spotsForSale: Map<
    number,
    {
      model: string;
      customer: number;
      employee: number;
      resetTimeout: NodeJS.Timeout;
    }
  >;

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
    return Object.fromEntries(this.spots);
  };

  private loadSpotData = async () => {
    await Config.awaitConfigLoad();
    await Util.awaitCondition(() => isInfoLoaded(), false);
    const config = Config.getConfigValue<VehicleShop.Config>('vehicles.shop');
    this.spots.clear();
    config.carSpots.forEach((data, id) => {
      this.spots.set(id, { ...data });
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

    // stop sale when model changed
    const saleSpotData = this.spotsForSale.get(spotId);
    if (saleSpotData) {
      clearTimeout(saleSpotData.resetTimeout);
      this.spotsForSale.delete(spotId);
    }

    this.spots.set(spotId, { ...spotData, model });
    this.playersInShop.forEach(ply => {
      Events.emitNet('vehicles:shop:changeModel', ply, spotId, model);
    });
  };

  private getPlayerSelectorOptions = () => {
    const options: { label: string; value: string }[] = [];
    for (const plyId of this.playersInShop) {
      const plyData = Core.getPlayer(plyId);
      if (!plyData) continue;
      options.push({
        label: `${plyData.charinfo.firstname} ${plyData.charinfo.lastname} | ${plyData.citizenid}`,
        value: String(plyId),
      });
    }
    return options;
  };

  @DGXEvent('vehicles:shop:allowPlayerToBuy')
  private _allowPlayerToBuy = async (employeeId: number, spotId: number, model: string) => {
    if (this.spots.get(spotId)?.model !== model) {
      const logMsg = `${Util.getName(employeeId)}(${employeeId}) tried to sell vehicle but model was out of sync`;
      Util.Log('vehicleshop:noPermissions', { spotId, model }, logMsg, employeeId, true);
      this.logger.error(logMsg);
      return;
    }

    const playerOptions = this.getPlayerSelectorOptions();

    const result = await UI.openInput(employeeId, {
      header:
        'Voor wie wil je het voertuig tekoop stellen?\nDeze persoon zal 3 minuten de tijd hebben om het voertuig te kopen.',
      inputs: [
        {
          label: 'Burger',
          name: 'target',
          type: 'select',
          options: playerOptions,
        },
      ],
    });
    if (!result.accepted) return;

    const customerId = Number(result.values.target);
    if (!customerId || isNaN(customerId)) {
      this.logger.debug('Input player invalid');
      return;
    }

    const employeeCid = Util.getCID(employeeId);

    // Check if src has perms to do this action
    if (!Business.isPlyEmployed('pdm', employeeCid)) {
      Util.Log(
        'vehicleshop:noPermissions',
        { employeeCid, spotId, model },
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

    const customerCid = Util.getCID(customerId);
    const maxTime = getVehicleShopConfig().timeForSale;

    this.spotsForSale.set(spotId, {
      model,
      customer: customerCid,
      employee: employeeCid,
      resetTimeout: setTimeout(() => {
        Notifications.add(customerId, `Je tijd om het voertuig te kopen is verlopen!`);
        this.spotsForSale.delete(spotId);
      }, maxTime * 1000),
    });

    Util.Log(
      'vehicleshop:allowToBuy',
      { employeeCid, spotId, model, customerCid },
      `${Util.getName(employeeId)}(${employeeId}) allowed a player to buy vehicle ${model}`,
      employeeId
    );
    this.logger.info(
      `Player ${employeeCid} allowed a player (${customerCid}) to buy vehicle ${model} at spot ${spotId}`
    );

    Notifications.add(customerId, `Je hebt ${maxTime / 60} minuten tijd om het voertuig te kopen`);
    Notifications.add(employeeId, `De persoon heeft ${maxTime / 60} minuten de tijd om het voertuig te kopen`);
  };

  @RPCEvent('vehicles:shop:canPlayerBuy')
  public canPlayerBuyVehicle = (plyId: number, spotId: number, model: string) => {
    if (!this.isEmployeeNeeded(model)) return true;
    const data = this.spotsForSale.get(spotId);
    if (!data) return false;
    return data.customer === Util.getCID(plyId) && data.model === model;
  };

  private isEmployeeNeeded = (model: string) => {
    if (this.isAnyEmployeeInside()) return true;

    const modelClass = getConfigByModel(model)?.class;
    if (!modelClass) {
      this.logger.error(`Could not get config of model ${model}`);
      return true;
    }
    return getVehicleShopConfig().classesThatNeedEmployee.includes(modelClass);
  };

  @DGXEvent('vehicles:shop:buyVehicle')
  private _buyVehicle = async (src: number, spotId: number, model: string) => {
    const price = getVehicleTaxedPrice(model);
    if (price === undefined) {
      this.logger.error(`Could not get purchase price for ${model}`);
      return;
    }

    const modelData = getConfigByModel(model);
    if (!modelData) {
      this.logger.error(`Could not get model data for ${model}`);
      return;
    }

    if (getModelStock(model) <= 0) {
      Notifications.add(src, 'Dit voertuig is niet op stock!', 'error');
      return;
    }

    const canBuy = this.canPlayerBuyVehicle(src, spotId, model);
    if (!canBuy) {
      Notifications.add(src, 'Je hebt een werknemer nodig om dit voertuig te kopen', 'error');
      return;
    }

    // require spawn position to be empty
    const spawnPosition = getVehicleShopConfig().vehicleSpawnLocation;
    if (Util.isAnyVehicleInRange(spawnPosition, 4)) {
      Notifications.add(
        src,
        'Er staat een voertuig in de weg, verplaats de wagen om de aankoop te kunnen voltooien',
        'error'
      );
      return;
    }

    const result = await UI.openInput(src, {
      header: `Ben je zeker dat je de ${modelData.brand} ${modelData.name} wil aanschaffen voor €${price} incl. BTW?`,
    });
    if (!result.accepted) return;

    const saleSpotData = this.spotsForSale.get(spotId);
    const employeeWhoSold = saleSpotData?.employee;
    const sellerCid = employeeWhoSold ?? Business.getBusinessOwner(getVehicleShopConfig().businessName)?.citizenid;
    if (!sellerCid) {
      Notifications.add(src, 'Er iets foutgelopen met de transactie', 'error');
      this.logger.error('Could not find business owner cid');
      Util.Log('vehicleshop:noOwner', {}, `Could not find business owner of pdm to sell vehicle`, undefined, true);
      return;
    }

    if (saleSpotData) {
      clearTimeout(saleSpotData.resetTimeout);
      this.spotsForSale.delete(spotId);
    }

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

    if (employeeWhoSold) {
      const employeeId = charModule.getServerIdFromCitizenId(employeeWhoSold);
      if (employeeId) {
        const ticketConfig = getVehicleShopConfig().employeeTicket;
        const ticketPrice = Math.round(
          Math.max(ticketConfig.min, Math.min(ticketConfig.max, modelData.price * (ticketConfig.percentage / 100)))
        );
        Inventory.addItemToPlayer(employeeId, 'sales_ticket', 1, {
          origin: 'generic',
          amount: ticketPrice,
          hiddenKeys: ['origin', 'amount'],
        });
      }
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
      { sellerCid, spotId, model, vin, plate, taxedPrice },
      `${Util.getName(src)} bought a vehicle (${model}) for ${taxedPrice}`,
      src
    );
    this.logger.info(`Player ${cid} bought a vehicle (${model}) for ${taxedPrice}`);
    Notifications.add(src, `Je ${modelData.brand} ${modelData.name} staat op je te wachten in de garage!`, 'success');

    const vehicleInfo = await getPlayerVehicleInfo(vin);
    const vehicle = await spawnOwnedVehicle(src, vehicleInfo!, spawnPosition);
    if (!vehicle) {
      Notifications.add(src, 'Kon je voertuig niet uithalen. Bekijk de Vehiclesapp om je voertuig te vinden', 'error');
      return;
    }

    await setVehicleState(vin, 'out');
  };

  public getModelAtSpot = (spotId: number) => {
    return this.spots.get(spotId)?.model;
  };

  public isAnyEmployeeInside = () => {
    const businessName = getVehicleShopConfig().businessName;
    for (const ply of this.playersInShop) {
      const cid = Util.getCID(ply, true);
      if (!cid) continue;
      const hired = Business.isPlyEmployed(businessName, cid);
      if (hired) return true;
    }
    return false;
  };
}

const shopManager = ShopManager.getInstance();
export default shopManager;
