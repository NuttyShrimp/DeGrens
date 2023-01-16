import { create } from '@src/lib/store';

export const useJobcenterAppStore = create<Phone.JobCenter.State & Phone.JobCenter.StateActions>('phone.app.jobcenter')(
  set => ({
    groups: [],
    jobs: [],
    currentGroup: null,
    groupMembers: [],
    isOwner: false,
    setGroup: (g, m, o) => set(() => ({ currentGroup: g, groupMembers: m, isOwner: o })),
    setJobs: jobs => set({ jobs }),
    setGroups: g => set(() => ({ groups: g })),
  })
);
