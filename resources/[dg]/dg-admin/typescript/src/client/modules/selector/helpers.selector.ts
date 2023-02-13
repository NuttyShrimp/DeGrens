import { Vector3 } from '@dgx/shared';

export const getForwardVector = (rotation: Vector3) => {
  const rot = rotation.multiply(Math.PI / 180);
  return Vector3.create({
    x: -Math.sin(rot.z) * Math.abs(Math.cos(rot.x)),
    y: Math.cos(rot.z) * Math.abs(Math.cos(rot.x)),
    z: Math.sin(rot.x),
  });
};
