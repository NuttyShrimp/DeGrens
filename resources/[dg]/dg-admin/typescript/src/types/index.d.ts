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
    // If command is just button, used for toggleBlackout or clearChat
    oneTime?: boolean;
  }
  interface Player {
    name: string;
    cid: number;
    serverId: number;
    steamId: string;
    firstName: string;
    lastName: string;
    points: number;
  }

  interface VehicleModel {
    name: string;
    brand: string;
    model: string;
    class: string;
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
  interface Weather {
    name: string;
  }
}

declare namespace Binds {
  type bindNames = 'bind-1' | 'bind-2' | 'bind-3';
}
