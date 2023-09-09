declare namespace Misc {
  namespace Cameras {
    type Info = {
      coords: Vec3;
      rotation: Vec3;
      allowMovement: boolean;
      onClose?: () => void;
    };
  }
}
