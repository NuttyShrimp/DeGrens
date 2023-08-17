declare namespace Objects {
  type CreateData = {
    model: string | number;
    coords: Vec3 | Vec4;
    rotation?: Vec3;
    flags?: Record<string, any>;
  };

  type ServerState = Omit<CreateData, 'rotation'> & {
    id: string;
    matrix: number[];
  };

  type CreateState = Omit<CreateData, 'rotation'> & {
    id: string;
    matrix: Float32Array;
  };

  type State = CreateState & {
    chunk: number;
  };

  type ActiveState = State & {
    entity?: number;
  };

  type SyncedCreateData = {
    model: string;
    coords: Vec3;
    rotation: Vec3;
    flags?: { onFloor?: boolean } & Record<string, any>;
    // Prevents the object from being stored in the DB
    skipStore?: boolean;
    skipScheduling?: boolean;
  };
}
