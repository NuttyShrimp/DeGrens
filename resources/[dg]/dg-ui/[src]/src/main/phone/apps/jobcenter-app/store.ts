import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.JobCenter.State> = {
  key: 'phone.apps.jobcenter',
  initialState: {
    groups: [],
    jobs: [],
    currentGroup: null,
    groupMembers: [],
    isOwner: false,
    isReady: false,
  },
};

export default store;
