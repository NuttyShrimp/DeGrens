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
    overrideModel?: string | number;
  };

  type ActiveProp = Prop & {
    entity: number | null;
    hash: number;
    deleted: boolean;
  };
}
