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
    payout: {
      max: number;
      min: number;
      /**
       * This is the percent that the total payout will do down by based on the group size
       * eg. 5 means if a player is alone the payout will be 100%, if it are 2 players: it will be 95%. 3 90%,...
       * This will be done so people get more money while doing a job in a group but not the double for the same amount of work
       */
      groupPercent: number;
    };
  }
  namespace Groups {
    interface Member {
      serverId: number;
      name: string;
      cid: number;
      // TODO: replace with enum for all possible jobs
      job: string;
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
