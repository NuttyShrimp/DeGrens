import { Events, Inventory, Notifications, Police, PropRemover, Util } from '@dgx/server';
import config from 'services/config';
import { atmLogger } from './logger.atm';
import { ATMS } from '../../../shared/atm/constants.atm';
import { Vector3 } from '@dgx/shared';

const activeRobberies: Criminal.ATM.Robbery[] = [];
const atmEntityRemovalTimeout: Record<number, NodeJS.Timeout> = {};

export const initAtmRobberyToClient = (plyId: number) => {
  const atmConfig = config.atm;
  Events.emitNet('criminal:atm:init', plyId, activeRobberies, atmConfig.whitelistedModels);
};

export const startRobbery = async (plyId: number, vehicleNetId: number, atmData: Criminal.ATM.AtmData) => {
  if (!Police.canDoActivity('atm_robbery')) return;

  if (!DoesEntityExist(NetworkGetEntityFromNetworkId(vehicleNetId))) return;

  const atmVector = Vector3.create(atmData.coords);
  if (activeRobberies.some(r => r.vehicleNetId === vehicleNetId || atmVector.distance(r.atmData.coords) < 1)) return;

  const drillItem = await Inventory.getFirstItemOfNameOfPlayer(plyId, 'big_drill');
  if (!drillItem) {
    Notifications.add(plyId, 'Je hebt geen boor', 'error');
    return;
  }

  const removedItem = await Inventory.removeItemByNameFromPlayer(plyId, 'atm_rope', 1);
  if (!removedItem) {
    Notifications.add(plyId, 'Je hebt geen touw', 'error');
    return;
  }

  Inventory.setQualityOfItem(drillItem.id, old => old - 25);

  const robbery: Criminal.ATM.Robbery = {
    vehicleNetId,
    atmData,
  };
  activeRobberies.push(robbery);
  Events.emitNet('criminal:atm:registerRobbery', -1, robbery);

  const logMsg = `${Util.getName(plyId)}(${plyId}) started an ATM robbery`;
  atmLogger.info(logMsg);
  Util.Log(
    'criminal:atm:start',
    {
      vehicleNetId,
      atmData,
    },
    logMsg,
    plyId
  );
};

export const unattachAtmFromWall = (plyId: number, vehicleNetId: number) => {
  const vehicle = NetworkGetEntityFromNetworkId(vehicleNetId);
  if (!DoesEntityExist(vehicle)) return;

  const robberyIdx = activeRobberies.findIndex(r => r.vehicleNetId === vehicleNetId);
  if (robberyIdx === -1) return;

  const activeRobbery = activeRobberies[robberyIdx];

  activeRobberies.splice(robberyIdx, 1);
  Events.emitNet('criminal:atm:unregisterRobbery', -1, vehicleNetId);

  createAtmEntity(vehicle, activeRobbery.atmData);
};

const createAtmEntity = async (vehicle: number, atmData: Criminal.ATM.AtmData) => {
  PropRemover.remove(atmData.model, atmData.coords);

  // move forward a little bit to avoid clipping in wall after setting velocity
  const atmCoords = Util.getOffsetFromCoords({ ...atmData.coords, w: atmData.rotation.z }, { x: 0, y: -0.5, z: 0 });

  const atmEntity = CreateObjectNoOffset(atmData.model, atmCoords.x, atmCoords.y, atmCoords.z, true, false, false);
  await Util.awaitEntityExistence(atmEntity);

  SetEntityRotation(atmEntity, atmData.rotation.x, atmData.rotation.y, atmData.rotation.z, 2, true);
  FreezeEntityPosition(atmEntity, false);
  Entity(atmEntity).state.set('isRobberyAtm', true, true);

  setTimeout(() => {
    const normalized = Util.getEntityCoords(vehicle).subtract(atmData.coords).normalize;
    SetEntityVelocity(atmEntity, normalized.x * 11, normalized.y * 11, normalized.z + 6);
  }, 25);

  atmEntityRemovalTimeout[atmEntity] = setTimeout(() => {
    DeleteEntity(atmEntity);
    delete atmEntityRemovalTimeout[atmEntity];
  }, 3 * 60 * 1000);
};

export const pickupAtm = (plyId: number, atmNetId: number) => {
  const atmEntity = NetworkGetEntityFromNetworkId(atmNetId);
  if (!atmEntity || !DoesEntityExist(atmEntity)) return;

  const model = GetEntityModel(atmEntity) >>> 0;
  const itemName = ATMS.find(a => GetHashKey(a.model) >>> 0 === model)?.itemName;
  if (!itemName) return;

  DeleteEntity(atmEntity);
  if (atmEntityRemovalTimeout[atmEntity]) {
    clearTimeout(atmEntityRemovalTimeout[atmEntity]);
    delete atmEntityRemovalTimeout[atmEntity];
  }

  Inventory.addItemToPlayer(plyId, itemName, 1);

  const logMsg = `${Util.getName(plyId)}(${plyId}) has picked up a robbery ATM`;
  atmLogger.info(logMsg);
  Util.Log('criminal:atm:pickupAtm', {}, logMsg, plyId);
};
