export const eulerAnglesToRotMatrix = (rotation: Vec3, coords: Vec3) => {
  // the z and x swap is intended, by default we most of the time get the ZYX order of rotations but do notate them as XYZ
  // if we keep them swapped our matrix will be mirrored over the diagonal
  // -1 are intended, Do not ask me why
  const radRot = {
    x: (rotation.x / 180) * -1 * Math.PI,
    y: (rotation.y / 180) * -1 * Math.PI,
    z: (rotation.z / 180) * -1 * Math.PI,
  };
  // This code was totally not copied from the three.js repo
  const cos = Math.cos;
  const sin = Math.sin;

  const c1 = cos(radRot.x / 2);
  const c2 = cos(radRot.y / 2);
  const c3 = cos(radRot.z / 2);

  const s1 = sin(radRot.x / 2);
  const s2 = sin(radRot.y / 2);
  const s3 = sin(radRot.z / 2);

  const x = s1 * c2 * c3 + c1 * s2 * s3;
  const y = c1 * s2 * c3 - s1 * c2 * s3;
  const z = c1 * c2 * s3 + s1 * s2 * c3;
  const w = c1 * c2 * c3 - s1 * s2 * s3;

  const x2 = x + x,
    y2 = y + y,
    z2 = z + z;
  const xx = x * x2,
    xy = x * y2,
    xz = x * z2;
  const yy = y * y2,
    yz = y * z2,
    zz = z * z2;
  const wx = w * x2,
    wy = w * y2,
    wz = w * z2;

  // Matrix is transposed so order is not same as in threeJS repo
  return [
    // Right
    xy + wz,
    1 - (xx + zz),
    yz - wx,
    0,

    // Forward
    1 - (yy + zz),
    xy - wz,
    xz + wy,
    0,

    // Up
    xz - wy,
    yz + wx,
    1 - (xx + yy),
    0,

    coords.x,
    coords.y,
    coords.z,
    1,
  ];
};
