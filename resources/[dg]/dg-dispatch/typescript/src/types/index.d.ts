declare type Direction = 'up' | 'down' | 'left' | 'right';

declare namespace Dispatch {
  interface Call {
    title: string;
    // entry with no icon
    description?: string;
    important?: boolean;
    // Plays synced sound alert
    syncedSoundAlert?: boolean;
    // FA-icon onto text besides it
    entries?: Record<string, string>;
    // Adds model and car color to call, should be server entity id (NOT NETWORK!)
    vehicle?: number;
    skipCoordsRandomization?: boolean;
    coords?: Vec3;
    // If call is from an officer/EMS with a callsign. use that as a tag
    officer?: number;
    // If criminal. It will check if he's in a veh and add it to the call
    criminal?: number;
    // a generic tag
    tag?: string;
    blip?: {
      sprite: number;
      color: number;
      radius?: number;
    };
    timestamp?: number;
  }

  type UICall = Omit<Call, 'officer' | 'criminal'> & { id: string; callsign?: string; timestamp: number };

  interface BlipInfo {
    text: string;
    job: string;
  }

  namespace Cams {
    interface Cam {
      label: string;
      coords: Vec3;
      defaultRotation: Vec3;
    }
  }
}
