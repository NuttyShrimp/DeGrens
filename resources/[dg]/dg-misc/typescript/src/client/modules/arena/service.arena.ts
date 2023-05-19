let currentInterior: Arena.Interior | null = null;

const loadAndGetInterior = (ipl: string, coords: Vec3) => {
  if (!IsIplActive(ipl)) {
    RequestIpl(ipl);
  }

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

  for (const entitySet of currentInterior.type.entitySets) {
    if (!IsInteriorPropEnabled(interiorId, entitySet)) continue;
    DisableInteriorProp(interiorId, entitySet);
  }

  for (const exteriorIpl of currentInterior.type.exteriorIpls) {
    if (!IsIplActive(exteriorIpl)) continue;
    RemoveIpl(exteriorIpl);
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

  currentInterior = interior;

  const interiorId = loadAndGetInterior(currentInterior.ipl, currentInterior.coords);
  if (!interiorId) return;

  for (const entitySet of currentInterior.type.entitySets) {
    if (IsInteriorPropEnabled(interiorId, entitySet)) continue;
    EnableInteriorProp(interiorId, entitySet);
  }

  for (const exteriorIpl of currentInterior.type.exteriorIpls) {
    if (IsIplActive(exteriorIpl)) continue;
    RequestIpl(exteriorIpl);
  }

  RefreshInterior(interiorId);

  console.log('[ARENA] Loaded interior');
};

export const handleArenaModuleResourceStop = () => {
  unloadCurrentArenaInterior();
};
