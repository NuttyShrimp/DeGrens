declare namespace Properties {
  type BaseProperty = {
    name: string;
    enter: Vector3;
    garage?: Vector4;
    locations: PropertyLocations;
    has_mailbox?: string;
    type: string;
  };

  type PropertyLocations = {
    stash?: Vec4;
    logout?: Vec4;
    clothing?: Vec4;
  };

  type ClientProperty = Omit<BaseProperty, 'has_mailbox'> & {
    hasKey: boolean;
    owned: boolean;
    accessList?: AccessListEntry[];
    has_mailbox: boolean;
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
