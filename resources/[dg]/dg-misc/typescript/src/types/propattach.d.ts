declare namespace PropAttach {
  type PropInfo = {
    model: string;
    boneId: number;
    position: Vec3;
    rotation: Vec3;
  };

  type ActiveProp = {
    netId: number | null;
    name: string;
    offset: Vec3;
  };
}
