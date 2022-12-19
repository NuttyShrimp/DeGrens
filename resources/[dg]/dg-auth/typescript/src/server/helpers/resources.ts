let resourceList: Set<string> = new Set();

export const createList = () => {
  resourceList.clear();
  const resNum = GetNumResources();
  for (let i = 0; i < resNum; i++) {
    resourceList.add(GetResourceByFindIndex(i));
  }
}

export const addStartedResource = (res: string) => {
  resourceList.add(res);
}

export const isResourceKnown = (res: string) => {
  return resourceList.has(res);
}
