import { Events, Util } from '@dgx/client';

let scheduledRemoval: NodeJS.Timeout | null = null;
const removedProps = new Map<number, PropRemover.Prop>();

export const registerRemovedProp = (props: PropRemover.RegisterArgs) => {
  for (const [id, prop] of props) {
    removedProps.set(Number(id), prop);
  }
  schedulePropRemoval();
};

export const unregisterRemovedProp = (propId: number) => {
  removedProps.delete(propId);
};

export const schedulePropRemoval = () => {
  if (scheduledRemoval) {
    clearTimeout(scheduledRemoval);
  }

  const plyCoords = Util.getPlyCoords();
  for (const [_, prop] of removedProps) {
    if (plyCoords.distance(prop.coords) > 300) continue;

    const entity = GetClosestObjectOfType(
      prop.coords.x,
      prop.coords.y,
      prop.coords.z,
      0.4,
      prop.model,
      false,
      false,
      false
    );

    if (!entity || !DoesEntityExist(entity) || NetworkGetEntityIsNetworked(entity)) continue;

    // For some reason you cant delete anything right after calling any of the functions above
    setTimeout(() => {
      SetEntityAsMissionEntity(entity, true, true);
      DeleteEntity(entity);
    }, 10);
  }

  scheduledRemoval = setTimeout(() => {
    schedulePropRemoval();
  }, 1000);
};

export const addRemovedProp = (entity: number) => {
  if (!entity || !DoesEntityExist(entity)) return;
  if (NetworkGetEntityIsNetworked(entity)) return;

  const model = GetEntityModel(entity);
  const coords = Util.getEntityCoords(entity);
  Events.emitNet('misc:propremover:remove', model, coords);
};
