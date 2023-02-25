let activeLabs: Record<Labs.Type, Labs.ActiveLab> | null = null;

const interiorData: Record<number, InteriorData> = {};

export const setActiveLabs = (active: Record<Labs.Type, Labs.ActiveLab>) => {
  activeLabs = active;
};

export const getLabTypeFromId = (labId: number) => {
  for (const type in activeLabs) {
    if (activeLabs[type as Labs.Type].id === labId) {
      return type as Labs.Type;
    }
  }
};

export const setInteriorData = (labId: number, data: InteriorData) => {
  interiorData[labId] = data;
};

export const setInteriorProps = (labId: number, props: string[]) => {
  interiorData[labId].props = props;
};

export const getInteriorData = () => interiorData;
