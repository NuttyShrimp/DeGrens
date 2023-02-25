import { Events, PolyTarget, PolyZone, Util } from '@dgx/client';
import { getInteriorData, getLabTypeFromId, setActiveLabs, setInteriorData, setInteriorProps } from 'services/labs';

const DOOR_OFFSET = { x: -14.5221, y: -2.0989, z: 7.9691 };

Events.onNet('labs:client:initLabs', (allLabCoords: Vec3[], activeLabs: Record<Labs.Type, Labs.ActiveLab>) => {
  setActiveLabs(activeLabs);

  for (const key in allLabCoords) {
    const labId = Number(key);
    const labCoords = allLabCoords[labId];

    // load interior & get data
    const interior = GetInteriorAtCoords(labCoords.x, labCoords.y, labCoords.z);
    RefreshInterior(interior);
    const interiorHeading = GetInteriorHeading(interior) * (180 / Math.PI);
    const [interiorCoordsArray] = GetInteriorLocationAndNamehash(interior);
    const interiorCoords = Util.ArrayToVector3(interiorCoordsArray);

    // save interior data to use later to build individual zones on enter
    setInteriorData(labId, {
      id: interior,
      coords: interiorCoords,
      heading: interiorHeading,
    });

    // build log zone at door entrance
    const doorPosition = Util.getOffsetFromCoords({ ...interiorCoords, w: interiorHeading }, DOOR_OFFSET);
    PolyZone.addBoxZone('lab_entrance', doorPosition, 3, 3, {
      heading: interiorHeading,
      minZ: doorPosition.z - 2,
      maxZ: doorPosition.z + 2,
      data: {
        id: labId,
      },
    });

    // If lab is not active, continue to next
    const type = getLabTypeFromId(labId);
    if (!type) continue;

    const activeData = activeLabs[type];
    for (const prop of activeData.interiorProps) {
      ActivateInteriorEntitySet(interior, prop);
    }
    setInteriorProps(labId, activeData.interiorProps);

    // Build polyzones
    PolyZone.addBoxZone('lab', interiorCoords, 19.0, 28.0, {
      heading: interiorHeading,
      minZ: interiorCoords.z - 3,
      maxZ: interiorCoords.z + 6,
      data: {
        id: labId,
        type,
      },
    });
  }
});

on('onResourceStop', (resourceName: string) => {
  if (GetCurrentResourceName() !== resourceName) return;

  PolyZone.removeZone('lab');
  PolyZone.removeZone('lab_entrance');
  PolyTarget.removeZone('lab_action');

  for (const interiorData of Object.values(getInteriorData())) {
    if (!interiorData.props) continue;
    RefreshInterior(interiorData.id);
    for (const prop of interiorData.props) {
      DeactivateInteriorEntitySet(interiorData.id, prop);
    }
  }
});

Events.onNet(
  'labs:client:buildLabZones',
  (type: Labs.Type, labId: number, peekZones: Labs.InteriorConfig['peekZones']) => {
    const interiorData = getInteriorData()[labId];
    if (!interiorData) return;

    for (let i = 0; i < peekZones.length; i++) {
      const peekZone = peekZones[i];
      const offset = Util.getOffsetFromCoords({ ...interiorData.coords, w: interiorData.heading }, peekZone.coords);

      PolyTarget.addCircleZone('lab_action', offset, 0.5, {
        useZ: true,
        data: {
          id: i,
          type,
          labId,
          action: peekZone.action,
          ...(peekZone.data ?? {}),
        },
      });
    }
  }
);

Events.onNet('labs:client:destroyLabZones', () => {
  PolyTarget.removeZone('lab_action');
});
