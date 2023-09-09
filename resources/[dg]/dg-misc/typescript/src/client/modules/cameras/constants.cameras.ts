export const CAMERAS_ENABLED_CONTROLS = [46, 249]; // push to talk keys

export const CAMERA_MOVEMENT_MODIFIERS = {
  up: { x: 0.3, y: 0, z: 0 },
  down: { x: -0.3, y: 0, z: 0 },
  left: { x: 0, y: 0, z: 0.4 },
  right: { x: 0, y: 0, z: -0.4 },
} satisfies Record<string, Vec3>; // By using satisfies we check type but we dont lose the string union when doing `keyof typeof`
