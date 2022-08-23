declare namespace UI {
  interface Entry {
    name: string;
    title: string;
    // Indicates if entry is a favorite for default
    favorite?: boolean;
    // If already enabled or not when opening UI.
    // Will change accordingly while UI is open.
    toggled?: boolean;
    // Is enabled if any value other than undefined is given
    bindable?: boolean;
    info?: {
      // Pre-defined selection fields
      inputs?: string[];
      // Fields can have any value
      overrideFields?: string[];
      checkBoxes?: string[];
    };
  }
  interface Player {
    name: string;
    cid: number;
    serverId: number;
    steamId: string;
    firstName: string;
    lastName: string;
  }

  interface Vehicle {
    model: string;
    name: string;
  }
  interface Job {
    name: string;
    ranks: number;
  }
  interface RoutingBucket {
    name: string;
    id: number;
  }
  interface PlayerData {
    bucketId: number;
  }
  interface Item {
    name: string;
    label: string;
    size: Vec2;
  }
}

declare namespace Binds {
  type bindNames = 'bind-1' | 'bind-2' | 'bind-3';
}
