let currentEntity: PeekEntity = {
  entity: 0,
  type: 0,
  coords: { x: 0, y: 0, z: 0 },
};
const activeZones: Map<string, { center: Vec3; data: any }> = new Map();

export const updateCurrentEntity = (entity: PeekEntity) => {
  currentEntity = entity;
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
