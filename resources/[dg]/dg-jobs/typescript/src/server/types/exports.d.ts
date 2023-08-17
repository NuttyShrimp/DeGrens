declare interface ServerExports {
  jobs: {
    getCurrentJob: (src: number) => string | undefined;
    getPlayersForJob: (job: string) => number[];
    signPlayerOutOfAnyJob: (plyId: number) => void;

    hasSpeciality: (src: number, speciality: string, job?: string) => boolean;
    addWhitelist: (src: number, jobName: string, rank = 1, cid?: number) => Promise<void>;
    removeWhitelist: (src: number, jobName: string, cid?: number) => Promise<void>;
    isWhitelisted: (plyId: number, job: string) => boolean;
    isCidWhitelisted: (cid: number, job: string) => boolean;
    isSteamIdWhitelisted: (steamId: string, job: string) => Promise<boolean>;
    getCurrentGrade: (src: number) => number;

    getJobPayout: (jobName: string, groupSize: number, payoutLevel?: number) => number | null;
    getJobPayoutLevel: (jobName: string) => number | undefined;
    registerJob: (name: string, info: Omit<Jobs.Job, 'name' | 'payoutLevel'>) => void;
    getPlayerAmountOfJobsFinishedMultiplier: (cid: number) => number;
  };
}
