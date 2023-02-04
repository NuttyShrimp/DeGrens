declare namespace Police {
  type Config = {
    speedzones: Speedzones.Config;
    config: {
      safes: Vec3[];
      labLocation: Vec3;
      lockers: Vec3[];
      patDownItems: string[];
      cuffTimeout: number;
      carryTimeout: number;
      checkableStatuses: StatusName[];
    };
    prison: Prison.Config;
    requirements: Record<string, Requirement>;
  };

  namespace Trackers {
    type Tracker = { netId: number; interval: NodeJS.Timer };
  }

  namespace Plateflags {
    type Flag = {
      id: string;
      plate: string;
      reason: string;
      issuedBy: number;
      issuedDate: number;
    };
  }

  namespace Speedzones {
    type Config = Record<string, { center: Vec3; length: number; width: number; heading: number }>;
  }

  namespace Evidence {
    type Type = 'bullet' | 'blood' | 'vehicleDamage';

    type Evidence = {
      id: string;
      coords: Vec3;
      type: Type;
      info: string;
    };
  }

  type CuffType = 'soft' | 'hard';

  namespace Prison {
    type Config = {
      itemRetrievalPlaces: Vec3[];
      prisonZone: Vec2[];
      insideJailSpawn: Vec4;
      outsideJailSpawn: Vec4;
      jailControl: Vec3;
      checkPrisoners: {
        center: Vec3;
        heading: number;
        length: number;
        width: number;
        minZ: number;
        maxZ: number;
      };
      whitelistedZoneVehicle: string[];
      shop: Vec3;
      camId: number;
    };
  }

  type CanRob = 'allowed' | 'checkAnim' | 'notAllowed';

  type Requirement = {
    police?: number;
    players?: number;
  };
}
