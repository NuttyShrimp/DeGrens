declare namespace RayCast {
  type Handler = (entity?: number, coords?: Vec3) => void;
}
declare namespace PolyZone {
  type Handler<T = any> = (name: string, data: T, center: Vec3) => void;
}
declare namespace Peek {
  type Type = 'model' | 'entity' | 'bone' | 'flag' | 'zone' | 'global';
}
