declare namespace StaticObjects {
  type CreateData = {
    model: string | number;
    coords: Vec3 | Vec4;
    rotation?: Vec3;
    flags?: Record<string, any>;
  };

  type State = CreateData & {
    id: string;
  };

  type Active = State & {
    entity: number;
  };
}
