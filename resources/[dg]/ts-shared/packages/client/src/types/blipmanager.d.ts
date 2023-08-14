declare namespace NBlipManager {
  type CreateData = { category: string; id: string } & Info;

  type Info = {
    coords: Vec3;
    color?: number;
    display?: number;
  } & (
    | {
        sprite: number;
        scale?: number;
        isShortRange?: boolean;
        text?: string;
      }
    | {
        radius: number;
      }
  );
}
