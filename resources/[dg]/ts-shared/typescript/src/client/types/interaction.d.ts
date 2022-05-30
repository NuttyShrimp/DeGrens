declare namespace RayCast {
  type Handler = (entity: number, type: 1 | 2 | 3, coords: Vec3) => void;
}
declare namespace PolyZone {
  type EnterHandler<T = any> = (name: string, data: T, center: Vec3) => void;
  type ExitHandler = (name: string) => void;
}
declare namespace Peek {
  type Type = 'model' | 'entity' | 'bone' | 'flag' | 'zone' | 'global';
}
