import { getCtxPlayerData } from './context';

export const canEntryBeEnabled = async (entry: PeekOption, entity: number): Promise<PeekOption | undefined> => {
  const PlayerData = getCtxPlayerData();
  if (entry.job) {
    if (typeof entry.job === 'string') {
      if (entry.job !== PlayerData.job.name) return;
    } else if (Array.isArray(entry.job)) {
      if (!entry.job.includes(PlayerData.job.name)) return;
    } else if (typeof entry.job === 'object') {
      if (!entry.job?.[PlayerData.job.name]) return;
      if (entry.job[PlayerData.job.name] > PlayerData.job.grade.level) return;
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
    if (typeof entry.items === 'string' && !(await DGCore.Functions.HasItem(entry.items))) return;
    else if (Array.isArray(entry.items)) {
      if (!entry.items.every(item => DGCore.Functions.HasItem(item))) return;
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
