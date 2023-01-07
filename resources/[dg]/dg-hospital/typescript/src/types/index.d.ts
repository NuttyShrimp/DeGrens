declare namespace Hospital {
  type Config = {
    damagetypes: Record<string, { downType: DownType; status: StatusName }>;
    needs: {
      interval: number;
      depletionRates: Record<CharacterNeed, number>;
    };
    health: {
      respawnTime: Record<DownType, number>;
      respawnPosition: Vec3;
      healItems: Record<string, HealItem>;
      weaponToStatus: Record<string, StatusName>;
    };
    job: {
      shopLocation: Vec3;
      lockerLocation: Vec3;
      checkinZone: { center: Vec3; length: number; width: number; minZ: number; maxZ: number; heading: number };
      checkableStatuses: StatusName[];
    };
    beds: Vec4[];
  };

  type DownType = 'unconscious' | 'dead';
  type State = 'alive' | DownType;

  type Needs = Record<CharacterNeed, number>;

  type HealItem = {
    taskbar: {
      icon: string;
      label: string;
      time: number;
    };
    animation: {
      animDict: string;
      anim: string;
      flags: number;
    };
    health?: number;
    bleed?: number;
  };
}
