import { RPC, SQL, Util } from '@dgx/server';
import { insertVehicleRestockDate, updateVehicleStock } from 'db/repository';
import * as fs from 'fs';

import { VEHICLE_TYPE_MAP } from './constants.info';
import { infoLogger } from './logger.info';
import { isSchemaValid } from './schema.info';

// key: modelhash, value: config
const vehicleInfo: Map<number, Config.CarSchema> = new Map();
const modelStock: Map<string, number> = new Map();
const root = GetResourcePath(GetCurrentResourceName());

let infoLoaded = false;
export const isInfoLoaded = () => infoLoaded;

let missingModelsChecked = false;

// Reads and validates the json and stores it in a map
export const loadVehicleInfo = () => {
  try {
    const data = fs.readFileSync(`${root}/seeding/vehicles.json`, 'utf-8');
    if (!isSchemaValid(data)) return;
    const info: Config.CarSchema[] = JSON.parse(data);
    info.forEach(car => {
      const hash = GetHashKey(car.model) >>> 0;
      if (vehicleInfo.has(hash)) {
        infoLogger.warn(`Duplicate model found: ${car.model}`);
        return;
      }
      vehicleInfo.set(hash, { ...car, hash });
    });
    validateDBStock();
    infoLogger.info(`Loaded ${vehicleInfo.size} vehicle config(s)`);
    infoLoaded = true;
  } catch (e) {
    infoLogger.error(`An error occured while loading the vehicle info from the json: ${e}`);
  }
};

export const getConfigByModel = (model: string | number) => {
  const modelHash = typeof model === 'string' ? GetHashKey(model) : model;
  const info = vehicleInfo.get(modelHash >>> 0);

  if (!info) {
    Util.Log(
      'vehicles:missingConfig',
      {
        model,
      },
      `Found a missing model`,
      undefined,
      true
    );
    infoLogger.warn(`Found a missing model: ${model}`);
  }

  return info;
};

export const getConfigByEntity = (entity: number) => {
  if (!DoesEntityExist(entity)) {
    infoLogger.error(`Could not get info of non-existing vehicle`);
    return;
  }

  const modelHash = GetEntityModel(entity);
  const config = getConfigByModel(modelHash);

  if (!config) {
    Util.sendRPCtoEntityOwner<string>(entity, 'vehicle:getArchType', NetworkGetNetworkIdFromEntity(entity)).then(
      modelName => {
        Util.Log(
          'vehicles:missingConfig',
          {
            model: modelName,
          },
          `Found a missing model`,
          undefined,
          true
        );
        infoLogger.warn(`Found a missing model: ${modelName}`);
      }
    );
  }

  return config;
};

/**
 * Make sure passed entity is a vehicle!
 */
export const getVehicleType = (veh: number) => VEHICLE_TYPE_MAP[GetVehicleType(veh)];

export const getVehicleModels = () => {
  return [...vehicleInfo.values()];
};

// All stock related bullshit
const validateDBStock = async () => {
  const result: { model: string; stock: number }[] = await SQL.query('SELECT * FROM vehicle_stock');
  result.forEach(x => modelStock.set(x.model, x.stock));

  // First we check if any model stock exists in db but the model does not exist in config, if so remove those from db
  const modelStockToDelete: string[] = [];
  modelStock.forEach((_, model) => {
    if (vehicleInfo.has(GetHashKey(model) >>> 0)) return;
    modelStockToDelete.push(model);
  });
  modelStockToDelete.forEach(model => {
    SQL.query('DELETE FROM vehicle_stock WHERE model = ?', [model]);
  });

  // Then we check if any model exists in config but not in db, if so add those to db
  const stocksToInsert: { model: string; stock: number }[] = [];
  vehicleInfo.forEach(car => {
    if (modelStock.has(car.model)) return;
    modelStock.set(car.model, car.defaultStock);
    stocksToInsert.push({
      model: car.model,
      stock: car.defaultStock,
    });
  });
  SQL.insertValues('vehicle_stock', stocksToInsert);
};

export const decreaseModelStock = (model: string) => {
  const daysTillRestock = getConfigByModel(model)?.restockTime;
  if (daysTillRestock === undefined) {
    infoLogger.error(`Could not get restocktime for ${model}`);
    return;
  }
  updateVehicleStock(model, -1);
  modelStock.set(model, Math.max(getModelStock(model) - 1, 0));
  // if restocktime is 0 then never restock so dont insert
  if (daysTillRestock !== 0) {
    insertVehicleRestockDate(model, daysTillRestock);
  }
};

export const getModelStock = (model: string) => modelStock.get(model) ?? 0;

export const assignModelConfig = (vehicle: number) => {
  const modelConfig: any = getConfigByEntity(vehicle);
  if (!modelConfig) return;

  const strippedConfig: Config.Car = {
    brand: modelConfig.brand,
    category: modelConfig.category,
    class: modelConfig.class,
    model: modelConfig.model,
    name: modelConfig.name,
    type: modelConfig.type,
  };
  Entity(vehicle).state.set('config', strippedConfig, true);
  return strippedConfig;
};

export const checkMissingModels = async (plyId: number) => {
  if (missingModelsChecked) return;

  const clientModels = (await RPC.execute<string[]>('vehicles:getAllVehicleModels', plyId)) ?? [];
  const allModels = clientModels.map(model => ({ hash: GetHashKey(model) >>> 0, model }));

  const missingModels: string[] = [];
  const invalidModels: string[] = [];

  for (const { hash, model } of allModels) {
    if (!!getConfigByModel(hash)) continue;
    missingModels.push(model);
  }

  for (const [hash, { model }] of vehicleInfo) {
    if (allModels.find(x => x.hash === hash)) continue;
    invalidModels.push(model);
  }

  const logMsg = `Found ${missingModels.length} missing and ${invalidModels.length} invalid models`;
  infoLogger.info(logMsg);
  if (missingModels.length > 0 || invalidModels.length > 0) {
    Util.Log('vehicles:modelValidation', { missingModels, invalidModels }, logMsg, undefined, true);
  }

  missingModelsChecked = true;
};

export const getCarboostVehiclePool = () => {
  const pool: Partial<Record<Vehicles.Class, string[]>> = {};
  for (const [_, info] of vehicleInfo) {
    if (!info.inCarboostPool) continue;
    (pool[info.class] ??= []).push(info.model);
  }
  return pool;
};
