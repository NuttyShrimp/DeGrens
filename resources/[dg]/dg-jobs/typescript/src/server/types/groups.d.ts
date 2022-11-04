declare namespace Groups {
  interface Member {
    serverId: number;
    name: string;
    cid: number;
    isReady: boolean;
  }
  interface Group extends JobGroup {
    members: Member[];
  }
}
