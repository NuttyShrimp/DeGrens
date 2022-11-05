declare namespace Groups {
  interface Member {
    serverId: number | null; // Null when still in group but not in server
    name: string;
    cid: number;
    isReady: boolean;
  }
  interface Group extends JobGroup {
    members: Member[];
  }
}
