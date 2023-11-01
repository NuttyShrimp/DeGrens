import { Util } from '@dgx/client';

export const getCheckpointObjectCoords = (center: Vec4, spread: number) => {
  return [
    Util.getOffsetFromCoords(center, { x: -1 * spread, y: 0, z: 0 }),
    Util.getOffsetFromCoords(center, { x: spread, y: 0, z: 0 }),
  ];
};

export const doLinesIntersect = (a: Vec3, b: Vec3, c: Vec3, d: Vec3) => {
  const denominator = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  const numerator_t = (a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x);
  const numerator_u = (a.x - c.x) * (a.y - b.y) - (a.y - c.y) * (a.x - b.x);

  if (denominator == 0) return numerator_u === 0 && numerator_t === 0;

  const t = numerator_t / denominator;
  const u = numerator_u / denominator;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};
