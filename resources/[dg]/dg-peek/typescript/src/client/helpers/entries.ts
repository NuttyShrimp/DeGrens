import { Business, Gangs, Inventory, Jobs } from '@dgx/client';
import { DEFAULT_DISTANCE } from 'cl_constant';
import { getCtxPlayerData } from './context';

export const canEntryBeEnabled = async (entry: PeekOption, entity: number): Promise<PeekOption | undefined> => {
  const { data: PlayerData } = getCtxPlayerData();
  if (entry.job) {
    const job = Jobs.getCurrentJob();
    if (job.name === null) return;
    if (typeof entry.job === 'string') {
      if (entry.job !== job.name) return;
    } else if (Array.isArray(entry.job)) {
      if (!entry.job.includes(job.name)) return;
    } else if (typeof entry.job === 'object') {
      if (!entry.job[job.name]) return;
      if (job.rank === null) return;
      if (entry.job[job.name] > job.rank) return;
    } else return;
  }
  if (entry.gang) {
    const plyGang = Gangs.getCurrentGang();
    if (plyGang === null) return;
    if (typeof entry.gang === 'string') {
      if (entry.gang !== plyGang) return;
    } else if (Array.isArray(entry.gang)) {
      if (!entry.gang.includes(plyGang)) return;
    } else return;
  }
  if (entry.business) {
    const isEmployed = entry.business.some(b => Business.isEmployee(b.name, b.permissions));
    if (!isEmployed) return;
  }
  if (entry.items) {
    const requiredItems = Array.isArray(entry.items) ? entry.items : [entry.items];
    const items = Inventory.getAllItemNames();
    if (!requiredItems.every(i => items.includes(i))) return;
  }
  if (!entry?._metadata?.state) {
    if (!entry._metadata) entry._metadata = {};
    entry._metadata.state = {};
  }
  if (entry.canInteract) {
    entry._metadata.state.canInteract = entry.canInteract(entity, entry.distance ?? DEFAULT_DISTANCE, entry);
    if (entry._metadata.state.canInteract instanceof Promise) {
      entry._metadata.state.canInteract = await entry._metadata.state.canInteract;
    }
  }
  entry._metadata.state.distance = false;
  return entry;
};

export const isEntryDisabled = (entry: PeekOption) => {
  if (entry.disabled) return true;
  if (!entry._metadata) return true;
  for (const key in entry._metadata.state) {
    if (entry._metadata.state[key] === false) return true;
  }
};
