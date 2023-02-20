declare namespace PropAttach {
  type PropInfo = {
    model: string;
    boneId: number;
    position: Vec3;
    rotation: Vec3;
  };

  type Prop = {
    name: string;
    offset: Vec3;
  };

  type ActiveProp = Prop & {
    entity: number;
    hash: number;
  };
}
