declare namespace Groups {
  interface Member {
    serverId: number;
    name: string;
    cid: number;
    // TODO: replace with enum for all possible jobs
    job: string;
    isReady: boolean;
  }
}