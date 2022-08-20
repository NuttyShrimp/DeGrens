export const concatId = (type: Inventory.Type, identifier: string | number) => `${type}__${identifier}`;

export const splitId = (id: string): { type: Inventory.Type; identifier: string } => {
  const splitted = id.split('__', 2);
  return {
    type: splitted[0] as Inventory.Type,
    identifier: splitted[1],
  };
};

export const positionToString = (pos: Vec2) => {
  return `x: ${pos.x}, y: ${pos.y}`;
};
