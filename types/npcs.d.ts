declare namespace NPCs {
  type SharedData = {
    model: string | number;
    position: Vec3 | Vec4;
    heading?: number;
    flags?: Record<string, any>;
  };

  type NPC = SharedData & {
    id: string;
    distance: number;
    settings: Record<'invincible' | 'freeze' | 'ignore' | 'collision', boolean>;
    clothing?: string;
    scenario?: string;
    blip?: {
      title: string;
      sprite: number;
      color: number;
      scale?: number;
    };
  };

  type Guard = SharedData & {
    routingBucket?: number;
    weapon?: string | number;
    criticalHits?: boolean; // DEFAULTS = TRUE
    deleteTime?: {
      dead?: number; // DEFAULT = 10 SECONDS
      alive?: number; // DEFAULT = 300 SECONDS
    };
    combat?: {
      movement?: number; // https://docs.fivem.net/natives/?_0x4D9CA1009AFBD057 DEFAULT = 2
      range?: number; // https://docs.fivem.net/natives/?_0x3C606747B23E497B DEFAULT = 2
    };
    doCombatTaskOnSpawn?: boolean; // DEFAULT = TRUE
    onDeath?: (killerServerId?: number) => void; // DEFAULT = -1
  };

  type ActiveGuard = {
    ped: number;
    deleteTimeout: NodeJS.Timeout;
    data: NPCs.Guard;
    health: number;
    isDeath: boolean;
    resourceName: string;
  };
}