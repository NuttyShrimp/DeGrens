let currentEntity: PeekEntity | null = null;
const activeZones: Map<string, { center: Vec3; data: any }> = new Map();

export const updateCurrentEntity = (ent: PeekEntity | null) => {
  currentEntity = ent;
};

export const getCurrentEntity = () => {
  return currentEntity;
};

export const getActiveZones = () => {
  return activeZones;
};

export const activateZone = (name: string, data: any, center: Vec3) => {
  activeZones.set(name, {
    center,
    data,
  });
};

export const deactivateZone = (name: string) => {
  activeZones.delete(name);
};
