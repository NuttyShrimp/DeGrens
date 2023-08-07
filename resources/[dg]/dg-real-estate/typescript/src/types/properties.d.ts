declare namespace Properties {
  type BaseProperty = {
    name: string;
    enter: Vector3;
    garage?: Vector4;
    locations: PropertyLocations;
    type: string;
  };

  type PropertyLocations = {
    stash?: Vec4;
    logout?: Vec4;
    clothing?: Vec4;
  };

  type ClientProperty = BaseProperty & {
    hasKey: boolean;
    owned: boolean;
    accessList?: AccessListEntry[];
    locked: boolean;
  };

  type ServerProperty = BaseProperty & {
    // Not all properties are saved in DB to prevent duplicated + stale data storage
    id?: number;
    owner?: number;
    access: number[];
  };

  type PropertyState = {
    locked: boolean;
  };

  type AccessListEntry = {
    cid: number;
    name: string;
  };
}
