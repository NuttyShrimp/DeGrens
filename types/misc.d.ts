declare namespace Misc {
  namespace Cameras {
    type Info = {
      coords: Vec3;
      rotation: Vec3;
      allowMovement: boolean;
      onClose?: () => void;
    };
  }

  namespace Particles {
    type Data = {
      dict: string;
      name: string;
      offset?: Vec3;
      rotation?: Vec3;
      scale?: number;
      looped: boolean;
    } & (
      | { coords: Vec3 }
      | ({ netId: number } & (({ ignoreBoneRotation?: boolean } & ({ boneName: string } | { boneIndex: number })) | {}))
    );
  }
}
