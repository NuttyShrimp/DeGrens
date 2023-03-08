import { Events, Notifications, Phone, Util, Inventory } from '@dgx/server';
import { getActiveMechanics, getMechanicConfig } from '../service.mechanic';
import vinManager from 'modules/identification/classes/vinmanager';

const pendingJobs = new Map<string, { targets: number[]; origin: number; timeoutInfo: NodeJS.Timeout }>();
const assignedJobs = new Map<string, number>();

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
  const activeMechanics = getActiveMechanics();
  const targets = Object.values(activeMechanics).reduce((targets, srvIds) => targets.concat(srvIds), []);
  pendingJobs.set(vin, {
    targets: targets,
    origin: src,
    timeoutInfo: setTimeout(() => {
      Notifications.add(src, 'Er was geen reactie op je takel aanvraag...');
    }, 30000),
  });
  targets.forEach(srvId => {
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
