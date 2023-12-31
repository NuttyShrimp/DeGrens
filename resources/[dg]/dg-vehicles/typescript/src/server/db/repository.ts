import { RPC, SQL } from '@dgx/server';
import { generateBaseCosmeticUpgrades, mergeUpgrades } from '@shared/upgrades/service.upgrades';
import upgradesManager from 'modules/upgrades/classes/manager.upgrades';

// We stringify the different vehicle_status columns when inserting them,
// When we get them we put all table columns in json obj and parse
// But the individual columns are still the stringified version
const parseStatus = (status: string): Vehicle.VehicleStatus => {
  const stringifiedObj = JSON.parse(status);
  return {
    body: Number(stringifiedObj.body),
    engine: Number(stringifiedObj.engine),
    fuel: Number(stringifiedObj.fuel),
    wheels: JSON.parse(stringifiedObj.wheels),
    windows: JSON.parse(stringifiedObj.windows),
    doors: JSON.parse(stringifiedObj.doors),
  };
};

const parseVehicleInfo = (info: Vehicle.Vehicle<string, string>): Vehicle.Vehicle => {
  return {
    ...info,
    status: parseStatus(info.status),
    stance: info.stance !== null ? JSON.parse(info.stance) : null,
    vinscratched: Boolean(info.vinscratched),
  };
};

/**
 * Get all vehicles for a player without filtering on the state
 * @param cid
 * @param garageId
 */

export const getPlayerOwnedVehicles = async (cid: number): Promise<Vehicle.Vehicle[]> => {
  const query = `SELECT pv.*,
                        JSON_OBJECT('body', vs.body, 'engine', vs.engine, 'fuel', vs.fuel, 'wheels', vs.wheels,
                                    'windows', vs.windows, 'doors', vs.doors) AS status
                 FROM player_vehicles as pv
                        LEFT OUTER JOIN vehicle_status vs on pv.vin = vs.vin
                 where pv.cid = ?
                 ORDER BY pv.vin DESC`;
  const vehicles = await SQL.query<Vehicle.Vehicle<string, string>[]>(query, [cid]);

  return vehicles.map(parseVehicleInfo);
};

/**
 * Get all vehicles for a player without filtering on the state
 * @param cid
 * @param garageId
 */

export const getPlayerOwnedVehiclesAtGarage = async (cid: number, garageId: string): Promise<Vehicle.Vehicle[]> => {
  const query = `SELECT pv.*,
                        JSON_OBJECT('body', vs.body, 'engine', vs.engine, 'fuel', vs.fuel, 'wheels', vs.wheels,
                                    'windows', vs.windows, 'doors', vs.doors) AS status
                 FROM player_vehicles as pv
                        LEFT OUTER JOIN vehicle_status vs on pv.vin = vs.vin
                 where pv.cid = ?
                   AND pv.garageId = ?
                 ORDER BY pv.vin DESC`;
  const vehicles = await SQL.query<Vehicle.Vehicle<string, string>[]>(query, [cid, garageId]);
  return vehicles.map(parseVehicleInfo);
};

export const getPlayerSharedVehicles = async (cid: number, garageId: string): Promise<Vehicle.Vehicle[]> => {
  const query = `SELECT pv.*,
                        JSON_OBJECT('body', vs.body, 'engine', vs.engine, 'fuel', vs.fuel, 'wheels', vs.wheels,
                                    'windows', vs.windows, 'doors', vs.doors) AS status
                 FROM player_vehicles as pv
                        LEFT OUTER JOIN vehicle_status vs on pv.vin = vs.vin
                 where pv.garageId = ?
                   AND pv.cid != ?
                 ORDER BY pv.vin DESC`;
  const vehicles = await SQL.query<Vehicle.Vehicle<string, string>[]>(query, [garageId, cid]);

  return vehicles.map(parseVehicleInfo);
};

export const getPlayerVehicleInfo = async (
  vin: string,
  checkGarage?: { cid: number; garageId: string; isSharedGarage: boolean }
): Promise<Vehicle.Vehicle | undefined> => {
  const args: any[] = [vin];
  let query = `SELECT pv.*,
                      JSON_OBJECT('body', vs.body, 'engine', vs.engine, 'fuel', vs.fuel, 'wheels', vs.wheels,
                                  'windows', vs.windows, 'doors', vs.doors) AS status
               FROM player_vehicles as pv
                      LEFT OUTER JOIN vehicle_status vs on pv.vin = vs.vin
               where pv.vin = ?`;
  if (checkGarage) {
    args.push(checkGarage.garageId);
    query += ` AND pv.garageId = ? AND pv.state = 'parked'`;
    if (!checkGarage.isSharedGarage) {
      args.push(checkGarage.cid);
      query += ` AND pv.cid = ?`;
    }
  }

  const result = await SQL.query<Vehicle.Vehicle<string, string>[]>(query, args);
  const info = result?.[0];
  if (!info) return;
  return parseVehicleInfo(info);
};

export const getVehicleLog = (vin: string) => {
  const query = `SELECT cid, action, state
                 FROM vehicle_garage_logs
                 WHERE vin = ?
                 ORDER BY logDate DESC, id DESC
                 LIMIT 30`;
  return SQL.query<Garage.ParkLog[]>(query, [vin]);
};

export const getVehicleStrikeAmount = async (vin: string): Promise<number> => {
  const query = `SELECT strikes
                 FROM vehicle_strikes
                 WHERE vin = ?`;
  const result = await SQL.query(query, [vin]);
  return result.strikes ?? 0;
};

export const getImpoundedVehicles = async (cid: number) => {
  const query = `SELECT *
                 FROM vehicle_depot_info
                 WHERE vin IN (SELECT vin
                               from player_vehicles
                               WHERE cid = ?
                                 AND state = 'impounded')`;
  return SQL.query<Depot.ImpoundedCar[]>(query, [cid]);
};

export const getImpoundedVehicle = async (cid: number, vin: string) => {
  const query = `SELECT vdi.*
                 FROM vehicle_depot_info AS vdi
                        JOIN player_vehicles USING (vin)
                 WHERE vin = ?
                   and cid = ?`;
  const result = await SQL.query<Depot.ImpoundedCar[]>(query, [vin, cid]);
  return result?.[0] ?? null;
};

export const doVehicleForfeiture = async (vin: string) => {
  const vehicle = await getPlayerVehicleInfo(vin);
  await deleteOwnedVehicle(vin);
  if (!vehicle) return;
  await SQL.insertValues('vehicle_resale', [
    {
      vin,
      model: vehicle.model,
      plate: vehicle.plate,
    },
  ]);
};

export const setAllVehiclesInGarage = () => {
  const query = `UPDATE player_vehicles
                 SET state = 'parked'
                 WHERE state = 'out'`;

  return SQL.query(query, []);
};

export const setVehicleState = (vin: string, state: Garage.GarageState): Promise<any> => {
  const query = 'UPDATE player_vehicles SET state = ? WHERE vin = ?';

  return SQL.query(query, [state, vin]);
};

export const setVehicleGarage = (vin: string, garageId: string): Promise<any> => {
  const query = 'UPDATE player_vehicles SET garageId = ? WHERE vin = ?';

  return SQL.query(query, [garageId, vin]);
};

export const setVehicleOwner = (vin: string, owner: number) => {
  const query = 'UPDATE player_vehicles SET cid = ? WHERE vin = ?';
  return SQL.query(query, [owner, vin]);
};

export const insertVehicleTransferLog = (vin: string, origin: number, target: number) => {
  return SQL.insertValues('vehicle_transfer_logs', [
    {
      vin,
      origin,
      target,
    },
  ]);
};

/**

 * Add new Vehicle to DB
 * @param vin
 * @param cid
 * @param model
 * @param plate
 * @param fakeplate
 * @param state
 * @param garageId
 */

export const insertNewVehicle = async (
  vin: string,
  cid: number,
  model: string,
  plate: string,
  fakeplate: string | null = null,
  state: Garage.GarageState = 'parked',
  garageId = 'alta_apartments',
  harness = 0,
  stance: Stances.Stance | null = null,
  wax: number | null = null,
  nos = 0,
  upgrades?: Vehicles.Upgrades.Cosmetic.Upgrades,
  vinscratched = false
) => {
  await SQL.insertValues('player_vehicles', [
    {
      vin,
      cid,
      model,
      plate,
      fakeplate,
      state,
      garageId,
      harness,
      stance: stance === null ? null : JSON.stringify(stance),
      wax,
      nos,
      vinscratched,
    },
  ]);

  await SQL.insertValues('vehicle_status', [
    {
      vin,
    },
  ]);

  insertVehicleTransferLog(vin, 0, cid);

  const fullUpgrades = mergeUpgrades<Vehicles.Upgrades.Cosmetic.Upgrades>(
    generateBaseCosmeticUpgrades(true, upgradesManager.doesModelHaveDefaultExtras(model)),
    upgrades ?? {}
  );
  updateVehicleCosmeticUpgrades(vin, fullUpgrades);
};

export const insertVehicleStatus = (vin: string, status: Vehicle.VehicleStatus): Promise<any> => {
  const query =
    'UPDATE vehicle_status SET body = ?, engine = ?, fuel = ?, wheels = ?, windows = ?, doors = ? WHERE vin = ?';

  return SQL.query(query, [
    status.body,
    status.engine,
    status.fuel,
    JSON.stringify(status.wheels),
    JSON.stringify(status.windows),
    JSON.stringify(status.doors),
    vin,
  ]);
};

export const insertVehicleParkLog = async (vin: string, cid: number, action: string, state: string) => {
  await SQL.insertValues('vehicle_garage_logs', [{ vin, cid, action, state }]);
};

export const getVehicleCosmeticUpgrades = async (
  vin: string
): Promise<Vehicles.Upgrades.Cosmetic.Upgrades | undefined> => {
  const query = `SELECT cosmetic
                 FROM vehicle_upgrades
                 WHERE vin = ?`;
  const result = await SQL.query<{ cosmetic: string }[]>(query, [vin]);
  const cosmeticJSON = result?.[0]?.cosmetic;
  if (!cosmeticJSON) return;
  return JSON.parse(cosmeticJSON);
};

export const updateVehicleCosmeticUpgrades = async (vin: string, upgrades: Vehicles.Upgrades.Cosmetic.Upgrades) => {
  const query = `INSERT INTO vehicle_upgrades (vin, cosmetic)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE cosmetic = VALUES(cosmetic)`;
  await SQL.query(query, [vin, JSON.stringify(upgrades)]);
};

export const updateVehicleHarness = async (vin: string, uses: number) => {
  const query = `UPDATE player_vehicles
                 SET harness = ?
                 WHERE vin = ?`;
  await SQL.query(query, [uses, vin]);
};

export const updateVehicleStance = async (vin: string, stanceData: Stances.Stance | null) => {
  const query = `UPDATE player_vehicles
                 SET stance = ?
                 WHERE vin = ?`;
  await SQL.query(query, [stanceData === null ? null : JSON.stringify(stanceData), vin]);
};

export const updateVehicleWax = async (vin: string, wax: number | null) => {
  const query = `UPDATE player_vehicles
                 SET wax = ?
                 WHERE vin = ?`;
  await SQL.query(query, [wax, vin]);
};

export const updateVehicleFakeplate = async (vin: string, fakeplate: string | null) => {
  const query = `UPDATE player_vehicles
                 SET fakeplate = ?
                 WHERE vin = ?`;
  await SQL.query(query, [fakeplate, vin]);
};

export const getVehicleItemUpgrades = async (vin: string): Promise<Vehicles.ItemUpgrade[]> => {
  const query = `SELECT items
                 FROM vehicle_upgrades
                 WHERE vin = ?`;
  const result = await SQL.scalar<{ items: string }>(query, [vin]);
  if (Object.keys(result).length === 0) return [];
  return JSON.parse(result.items);
};

export const updateVehicleItemUpgrades = async (vin: string, items: string[]) => {
  const query = `UPDATE vehicle_upgrades
                 SET items = ?
                 WHERE vin = ?`;
  await SQL.query(query, [JSON.stringify(items), vin]);
};

export const updateVehicleNos = async (vin: string, nos: number) => {
  const query = `UPDATE player_vehicles
                 SET nos = ?
                 WHERE vin = ?`;
  await SQL.query(query, [nos, vin]);
};

export const putVehicleInImpound = async (vin: string, reason: Depot.Reason) => {
  await setVehicleState(vin, 'impounded');
  await SQL.insertValues('vehicle_depot_info', [
    {
      vin,
      price: reason.price,
      until: reason.time === -1 ? -1 : Math.round(Date.now() / 1000) + 3600 * reason.time,
    },
  ]);
  await SQL.query(
    `INSERT INTO vehicle_strikes (vin, strikes)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE strikes = strikes + ?`,
    [vin, reason.strike, reason.strike]
  );
};

export const removeVehicleFromImpound = async (vin: string) => {
  await setVehicleState(vin, 'out');
  await SQL.query('DELETE FROM vehicle_depot_info WHERE vin = ?', [vin]);
};

// #region Everything veh stock related

export const insertVehicleRestockDate = async (model: string, daysTillRestock: number) => {
  const query = 'INSERT INTO vehicle_restocks (model, restockDate) VALUES (?, ADDDATE(CURDATE(), ?))';
  await SQL.query(query, [model, daysTillRestock]);
};

export const updateVehicleStock = async (model: string, amount: number) => {
  const query = 'UPDATE vehicle_stock SET stock = stock + (?) WHERE model = ?';
  await SQL.query(query, [amount, model]);
};

export const checkVehicleRestocks = async () => {
  const restocks = await SQL.query<{ id: number; model: string }[]>(
    `SELECT id, model
     FROM vehicle_restocks
     WHERE NOW() >= restockDate`
  );
  if (!restocks) return;
  for (const stock of restocks) {
    await SQL.query('DELETE FROM vehicle_restocks WHERE id = ?', [stock.id]);
    await updateVehicleStock(stock.model, 1);
  }
};

// #endregion

export const checkVehicleStrikes = async (fallOffDays: number) => {
  SQL.query(`DELETE
             FROM vehicle_strikes
             WHERE updated_at < (NOW() - INTERVAL ${fallOffDays} DAY)`);
};

export const deleteOwnedVehicle = async (vin: string) => {
  await SQL.query(
    `DELETE
     FROM player_vehicles
     WHERE vin = ?`,
    [vin]
  );
};

export const hasVehicleMaintenanceFees = async (vin: string) => {
  const debtCount = await SQL.query('SELECT COUNT(*) as count FROM debts WHERE reason = ?', [`veh_${vin}`]);
  return (debtCount?.[0]?.count ?? 0) !== 0 ?? false;
};

export const updateVehicleEngineSound = async (vin: string, soundHash: string | null) => {
  const query = `UPDATE player_vehicles
                 SET engineSound = ?
                 WHERE vin = ?`;
  await SQL.query(query, [soundHash, vin]);
};
