declare interface JobGroupMember {
  name: string;
  ready: boolean;
  isOwner: boolean;
}

declare interface JobGroup {
  id: string;
  name: string;
  size: number;
  limit: number;
}