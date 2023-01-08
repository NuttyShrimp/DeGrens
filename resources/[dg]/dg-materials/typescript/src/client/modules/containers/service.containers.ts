import { Interiors, Notifications, Util, RPC, Taskbar, Events, PolyTarget, Peek } from '@dgx/client';

let containerProps: Materials.Containers.Prop<number>[];

export const registerContainerProps = (props: Materials.Containers.Prop<string>[]) => {
  containerProps = props.map(p => ({ ...p, model: GetHashKey(p.model) }));

  Peek.addModelEntry(
    containerProps.map(i => i.model),
    {
      options: [
        {
          label: 'Proberen Openen',
          icon: 'fas fa-lock',
          action: (_, entity) => {
            if (!entity) return;
            enterContainer(entity);
          },
          canInteract: entity => {
            if (!entity) return false;
            const entrance = getContainerEntrance(entity);
            return Util.getPlyCoords().distance(entrance) < 1.5;
          },
        },
      ],
      distance: 3.0,
    }
  );
};

export const getContainerEntrance = (entity: number) => {
  const model = GetEntityModel(entity);
  const doZOffset = containerProps.find(d => d.model === model)?.doZOffset ?? true;
  const [min, max] = GetModelDimensions(model);
  const yOffset = (max[1] - min[1]) / -2;
  const zOffset = (max[2] - min[2]) / 2;
  return Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(entity, 0, yOffset, doZOffset ? zOffset : 0));
};

export const enterContainer = async (entity: number) => {
  const containerCoords = getContainerEntrance(entity);

  const isValidContainer = await RPC.execute<boolean>('materials:containers:isValid', containerCoords);
  if (!isValidContainer) {
    Notifications.add('Deze deur is vastgeroest', 'error');
    return;
  }

  const canEnter = await RPC.execute<boolean>('materials:containers:canEnter', containerCoords);
  if (!canEnter) {
    Notifications.add('Deze deur zit op slot', 'error');
    return;
  }

  const containerHeading = GetEntityHeading(entity);
  const animStartPos = Util.getOffsetFromCoords({ ...containerCoords, w: containerHeading }, { x: 0, y: -0.7, z: 0 });
  await Util.goToCoords({ ...animStartPos, w: containerHeading });

  const [canceled] = await Taskbar.create('door-open', 'Openen', 30000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
    animation: {
      animDict: 'amb@prop_human_parking_meter@male@base',
      anim: 'base',
      flags: 17,
    },
  });
  if (canceled) return;

  const position = Util.getEntityCoords(entity);
  DoScreenFadeOut(500);
  await Util.Delay(500);
  await Interiors.createRoom('bench_container', position.subtract({ x: 0, y: 0, z: 50 }));
  await Util.Delay(500);
  DoScreenFadeIn(500);
  Events.emitNet('materials:containers:entered', containerCoords);
};

export const buildMoldZone = (coords: Vec3) => {
  PolyTarget.addCircleZone('materials_mold_melting', coords, 4, { useZ: true, data: {} });
};
