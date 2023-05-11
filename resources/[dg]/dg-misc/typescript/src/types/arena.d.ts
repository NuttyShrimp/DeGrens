declare namespace Arena {
  type Interior = {
    ipl: string;
    coords: Vec3;
    type: Type;
  };

  type Type = {
    entitySets: string[];
    exteriorIpls: string[];
  };
}
