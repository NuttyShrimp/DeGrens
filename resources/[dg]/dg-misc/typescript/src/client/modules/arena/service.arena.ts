let currentInterior: Arena.Interior | null = null;

const loadAndGetInterior = (ipl: string, coords: Vec3) => {
  RequestIpl(ipl);
  const interiorId = GetInteriorAtCoords(coords.x, coords.y, coords.z);
  if (!IsValidInterior(interiorId)) {
    console.error(`Failed to load arena interior | ${JSON.stringify(currentInterior)}`);
    return;
  }
  return interiorId;
};

export const unloadCurrentArenaInterior = () => {
  if (!currentInterior) return;

  const interiorId = loadAndGetInterior(currentInterior.ipl, currentInterior.coords);
  if (!interiorId) return;

  for (const entitySet of currentInterior.entitySets) {
    DisableInteriorProp(interiorId, entitySet);
  }

  RefreshInterior(interiorId);

  currentInterior = null;
  console.log('[ARENA] Unloaded interior');
};

export const loadArenaInterior = (interior: Arena.Interior) => {
  if (currentInterior) {
    console.error(`Tried to load arena interior but one was already loaded`);
    return;
  }

  const interiorId = loadAndGetInterior(interior.ipl, interior.coords);
  if (!interiorId) return;

  for (const entitySet of interior.entitySets) {
    EnableInteriorProp(interiorId, entitySet);
  }

  RefreshInterior(interiorId);

  currentInterior = interior;
  console.log('[ARENA] Loaded interior');
};

export const handleArenaModuleResourceStop = () => {
  unloadCurrentArenaInterior();
};
