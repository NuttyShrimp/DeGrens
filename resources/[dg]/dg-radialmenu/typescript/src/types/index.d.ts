declare namespace RadialMenu {
  interface BaseEntry {
    title: string;
    icon: string; // icon name without fas fa-
    jobs?: string[];
    items?: string[];
    minimumPlayerDistance?: number; // Only enable entry when closest player is within this distance (and outside vehicle)
    isEnabled?: (data: Context) => boolean | Promise<boolean>;
    shouldClose?: boolean;
  }

  interface Context {
    playerData: PlayerData;
    job: {
      name: string | null;
      rank: number | null;
    };
    currentVehicle?: number;
    raycastEntity?: number;
    items: string[];
    closestPlayerDistance: number;
  }

  interface SubmenuEntry extends BaseEntry {
    subMenu: string;
  }

  interface ActionEntry extends BaseEntry {
    type: 'client' | 'server' | 'dgxClient' | 'dgxServer';
    event: string;
    data?: Record<string, any>;
  }

  type Entry = SubmenuEntry | ActionEntry;

  type UIEntry = Pick<BaseEntry, 'title' | 'icon' | 'shouldClose'> & { items?: UIEntry[] } & Partial<
      Omit<ActionEntry, 'items'>
    >;
}
