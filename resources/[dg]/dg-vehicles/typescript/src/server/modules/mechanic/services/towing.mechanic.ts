import { Events, Notifications, Phone, Util, Inventory, Business } from '@dgx/server';
import { getMechanicConfig } from '../service.mechanic';
import vinManager from 'modules/identification/classes/vinmanager';

const pendingJobs = new Map<string, { targets: number[]; origin: number; timeoutInfo: NodeJS.Timeout }>();
const assignedJobs = new Map<string, number>();
let modelOffsets: Record<number, Vec3> = {};

const getTowOffset = (vehicle: number) => {
  const modelHash = GetEntityModel(vehicle) >>> 0;
  return modelOffsets[modelHash];
};

export const setTowOffsets = (offset: Record<string, Vec3>) => {
  modelOffsets = Object.entries(offset).reduce((acc, [model, offset]) => {
    const modelHash = GetHashKey(model) >>> 0;
    acc[modelHash] = offset;
    return acc;
  }, {} as typeof modelOffsets);
};

export const sendTowJob = (src: number, vin: string) => {
  const notification: Phone.Notification = {
    title: 'Sleep aanvraag',
    description: 'Accepteer om aan te nemen',
    icon: {
      name: 'truck-tow',
      background: 'black',
      color: 'white',
    },
    id: `tow-request-${vin}`,
    _data: {
      vin,
    },
    onAccept: 'vehicles:mechanic:acceptTowJob',
  };
  const activeMechanics = Business.getSignedInPlayersForType('mechanic');
  pendingJobs.set(vin, {
    targets: activeMechanics,
    origin: src,
    timeoutInfo: setTimeout(() => {
      Notifications.add(src, 'Er was geen reactie op je takel aanvraag...');
    }, 30000),
  });
  activeMechanics.forEach(srvId => {
    Phone.showNotification(srvId, notification);
  });
};

export const overwriteTowJob = (src: number, vin: string) => {
  const job = pendingJobs.get(vin);
  if (!job) {
    sendTowJob(src, vin);
    return;
  }
  clearTimeout(job.timeoutInfo);
  pendingJobs.set(vin, {
    targets: job.targets,
    origin: src,
    timeoutInfo: setTimeout(() => {
      Notifications.add(src, 'Er was geen reactie op je takel aanvraag...');
    }, 30000),
  });
};

export const isPlayerAssigned = (src: number, vin: string) => {
  const assignedPly = assignedJobs.get(vin);
  if (!assignedPly) return false;
  return assignedPly === src;
};

export const finishJob = (vin: string) => {
  const assignedPly = assignedJobs.get(vin);

  if (!assignedPly) return false;
  assignedJobs.delete(vin);
};

export const tryAcceptingJob = (src: number, vin: string) => {
  const jobInfo = pendingJobs.get(vin);
  if (!jobInfo) {
    Notifications.add(src, 'Iemand was je voor!', 'error');
    return;
  }
  clearTimeout(jobInfo.timeoutInfo);
  jobInfo.targets.forEach(srvId => {
    emitNet('dg-phone:client:notification:remove', srvId, `tow-request-${vin}`);
  });
  Notifications.add(jobInfo.origin, 'Er is takeldienst onderweg voor je aanvraag!');
  assignedJobs.set(vin, src);
  const vehNetId = vinManager.getNetId(vin);
  if (!vehNetId) return;
  const veh = NetworkGetEntityFromNetworkId(vehNetId);
  const vehCoords = Util.ArrayToVector3(GetEntityCoords(veh));
  Events.emitNet('vehicles:mechanic:assignJob', src, vin, vehCoords);

  Inventory.addItemToPlayer(src, 'sales_ticket', 1, {
    origin: 'generic',
    amount: getMechanicConfig().towingTicketPrice,
    hiddenKeys: ['origin', 'amount'],
  });
};

export const attachVehicleToTowVehicle = (towVehicleNetId: number, attachVehicleNetId: number) => {
  const towVehicle = NetworkGetEntityFromNetworkId(towVehicleNetId);
  const attachVehicle = NetworkGetEntityFromNetworkId(attachVehicleNetId);
  if (!DoesEntityExist(towVehicle) || !DoesEntityExist(attachVehicle)) return;

  Entity(towVehicle).state.set('attachedVehicle', attachVehicle, true);
  Util.sendEventToEntityOwner(
    attachVehicle,
    'vehicles:towing:attach',
    towVehicleNetId,
    attachVehicleNetId,
    getTowOffset(towVehicle)
  );
};

export const removeVehicleFromTowVehicle = (towVehicleNetId: number) => {
  const towVehicle = NetworkGetEntityFromNetworkId(towVehicleNetId);
  if (!DoesEntityExist(towVehicle)) return;

  const attachedVehicle = Entity(towVehicle).state.attachedVehicle;
  Entity(towVehicle).state.set('attachedVehicle', null, true);

  if (!attachedVehicle || !DoesEntityExist(attachedVehicle)) return;

  Util.sendEventToEntityOwner(
    attachedVehicle,
    'vehicles:towing:unattach',
    towVehicleNetId,
    NetworkGetNetworkIdFromEntity(attachedVehicle)
  );
};
