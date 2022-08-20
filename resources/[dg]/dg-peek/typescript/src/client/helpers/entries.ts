import { Inventory } from '@dgx/client';
import { getCtxPlayerData } from './context';

export const canEntryBeEnabled = async (entry: PeekOption, entity: number): Promise<PeekOption | undefined> => {
  const { data: PlayerData, job } = getCtxPlayerData();
  if (entry.job) {
    if (typeof entry.job === 'string') {
      if (entry.job !== job.name) return;
    } else if (Array.isArray(entry.job)) {
      if (!entry.job.includes(job.name)) return;
    } else if (typeof entry.job === 'object') {
      if (!entry.job?.[job.name]) return;
      if (entry.job[job.name] > job.grade) return;
    } else return;
  }
  if (entry.gang) {
    if (typeof entry.gang === 'string') {
      if (entry.gang !== PlayerData.gang.name) return;
    } else if (Array.isArray(entry.gang)) {
      if (!entry.gang.includes(PlayerData.gang.name)) return;
    } else return;
  }
  if (entry.items) {
    if (!(await Inventory.doesPlayerHaveItems(entry.items))) {
      return;
    }
  }
  if (!entry?._metadata?.state) {
    if (!entry._metadata) entry._metadata = {};
    entry._metadata.state = {};
  }
  if (entry.canInteract) {
    entry._metadata.state.canInteract = entry.canInteract(entity, entry.distance, entry);
    if (entry._metadata.state.canInteract instanceof Promise) {
      entry._metadata.state.canInteract = await entry._metadata.state.canInteract;
    }
  }
  if (entry.distance) {
    entry._metadata.state.distance = false;
  }
  return entry;
};

export const isEntryDisabled = (entry: PeekOption) => {
  if (entry.disabled) return true;
  for (const key in entry._metadata.state) {
    if (entry._metadata.state[key] === false) return true;
  }
};
