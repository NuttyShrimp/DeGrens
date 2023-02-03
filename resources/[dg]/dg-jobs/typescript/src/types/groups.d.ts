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
  idle: boolean;
}

declare type UIStoreData = {
  currentGroup?: Omit<JobGroup, 'idle'> | null;
  groupMembers?: JobGroupMember[];
  isOwner?: boolean;
};
