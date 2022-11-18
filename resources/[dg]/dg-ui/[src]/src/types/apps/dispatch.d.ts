declare namespace Dispatch {
  interface Call {
    id: string;
    title: string;
    important?: boolean;
    // entry with no icon
    description?: string;
    // FA-icon onto text besides it
    entries: Record<string, string>;
    coords?: Vec3;
    // If call is from an officer/EMS with a callsign. use that as a tag
    callsign?: string;
    // a generic tag
    tag?: string;
    timestamp: number;
  }

  interface Cam {
    id: number;
    label: string;
  }

  interface State extends Base.State {
    // Acts as buffer where fifo is being used when an overflow occurs
    calls: Call[];
    storeSize: number;
    cams: Cam[];
  }
}