import { Business, Gangs, Jobs, Util } from '@dgx/client';

// Check if player complies to 1 of the requirements
export const isAuthorized = (doorData: Doorlock.ClientData[number]) => {
  const authorized = doorData.authorized;

  if (authorized.business) {
    const isBusinessEmployee = authorized.business.some(b => Business.isEmployee(b, ['property_access']));
    if (isBusinessEmployee) {
      return true;
    }
  }

  // Check if gang member
  if (authorized.gang) {
    const currentGang = Gangs.getCurrentGang();
    if (currentGang && authorized.gang.includes(currentGang)) {
      return true;
    }
  }

  // Check job
  if (authorized.job) {
    const currentJob = Jobs.getCurrentJob();
    if (currentJob.name !== null) {
      const hasJob = authorized.job.find(j => {
        const sameName = j.name === currentJob.name;
        if (!sameName) return false;
        if (j.rank === undefined) return true;
        if (currentJob.rank === null) return false;
        if (currentJob.rank < j.rank) return false;
        return true;
      });
      if (hasJob !== undefined) {
        return true;
      }
    }
  }

  return false;
};

const getDoorsOfDoorSystem = () => {
  try {
    return DoorSystemGetActive() as [number, number][];
  } catch (_) {}
  return [];
};

// Sadly the findexistingdoor native does not work, so were back to iterating
export const getDoorId = (entity: number | undefined) => {
  if (!entity) return;
  if (GetEntityType(entity) !== 3) return;

  const doors = getDoorsOfDoorSystem();
  return doors.find(([_, handle]) => handle === entity)?.[0];
};

export const doDoorAnimation = async () => {
  const ped = PlayerPedId();
  if (IsPedInAnyVehicle(ped, true)) return;
  await Util.loadAnimDict('anim@heists@keycard@');
  TaskPlayAnim(ped, 'anim@heists@keycard@', 'exit', 5.0, 1.0, -1, 48, 0, false, false, false);
  setTimeout(() => {
    StopAnimTask(ped, 'anim@heists@keycard@', 'exit', 1.0);
  }, 400);
};
