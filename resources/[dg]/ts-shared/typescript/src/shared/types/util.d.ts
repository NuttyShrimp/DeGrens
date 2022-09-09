declare namespace Particles {
  type Target = { coords: Vec3 } | { netId: number } | { netId: number; boneName: string };

  type Particle = {
    dict: string;
    name: string;
    offset?: Vec3;
    rotation?: Vec3;
    scale?: number;
    looped: boolean;
  } & Target;

  // only looped return ptfx handle
  type Data = Required<Particle> & { ptfx?: number };
}
