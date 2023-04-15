import { Events } from '@dgx/server';

let nextPropId = 1;
const removedProps = new Map<number, PropRemover.Prop>();

export const addRemovedProp = (prop: PropRemover.Prop) => {
  const propId = nextPropId;
  nextPropId++;

  removedProps.set(propId, prop);
  Events.emitNet('misc:propremover:register', -1, [[propId, prop]] satisfies PropRemover.RegisterArgs);

  return propId;
};

export const restoreRemovedProp = (propId: number) => {
  const deleted = removedProps.delete(propId);
  if (!deleted) return;
  Events.emitNet('misc:propremover:unregister', -1, propId);
};

export const seedRemovedProps = (plyId: number) => {
  const props: PropRemover.RegisterArgs = [...removedProps.entries()].map(([id, p]) => [+id, p]);
  Events.emitNet('misc:propremover:register', plyId, props);
};
