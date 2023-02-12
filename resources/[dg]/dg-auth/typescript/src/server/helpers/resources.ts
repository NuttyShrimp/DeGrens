let resourceList: Set<string> = new Set();
let recentStarts: Set<string> = new Set();
let startTimeOuts: Record<string, NodeJS.Timeout> = {};

export const createList = () => {
  resourceList.clear();
  const resNum = GetNumResources();
  for (let i = 0; i < resNum; i++) {
    resourceList.add(GetResourceByFindIndex(i));
  }
};

export const addStartedResource = (res: string) => {
  resourceList.add(res);
  if (startTimeOuts[res]) {
    clearTimeout(startTimeOuts[res]);
  }
  recentStarts.add(res);
  // 1min looks high but it is the standard max timeout time.
  // If a user has no connection for 15secs and than sends this after we deleted it but it would be valid we would false ban him
  startTimeOuts[res] = setTimeout(() => {
    recentStarts.delete(res);
    delete startTimeOuts[res];
  }, 60000);
};

export const isResourceKnown = (res: string) => {
  return resourceList.has(res);
};

export const isRecentlyRestarted = (res: string) => {
  return recentStarts.has(res);
}
