declare namespace Jobs {
  interface Job {
    title: string;
    /**
     * A Font Awesome icon name. (minus the `fa-` prefix)
     */
    icon: string;
    size: number;
    /**
     * Determines if someone can set the location to this job.
     */
    legal: boolean;
    /**
     * This will be used to set the location where you can sign in to the job.
     */
    location?: {
      x: number;
      y: number;
    };
    payout?: {
      max: number;
      min: number;
      /**
       * This the percent a player gets extra per groupmember.
       * For example: a job with payout of 200. If this percentage is 10, when doing job alone a player gets 200.
       * When doing job with 1 other person they both get 220. When doing with 6 members they all get 300
       */
      groupPercent: number;
    };
  }

  namespace Groups {
    interface Member {
      serverId: number | null;
      name: string;
      cid: number;
      isReady: boolean;
    }
    interface Group {
      id: string;
      name: string;
      size: number;
      limit: number;
      job: string;
      members: Member[];
      owner: Member;
    }
  }
}

declare namespace NPolice {
  interface DispatchCall {
    title: string;
    // entry with no icon
    description?: string;
    important?: boolean;
    // FA-icon onto text besides it
    entries?: Record<string, string | number>;
    // Adds model and car color to call, should be server entity id (NOT NETWORK!)
    vehicle?: number;
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
  }
}
