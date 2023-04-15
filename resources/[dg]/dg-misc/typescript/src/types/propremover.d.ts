declare namespace PropRemover {
  type Prop = {
    model: number;
    coords: Vec3;
  };

  type RegisterArgs = [number, PropRemover.Prop][];
}
