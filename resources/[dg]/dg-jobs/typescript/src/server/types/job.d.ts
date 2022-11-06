declare namespace Jobs {
  interface Job {
    name: string;
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
    /**
     * 1 - 6 (inclusive)
     */
    payoutLevel: number;
  }
}
