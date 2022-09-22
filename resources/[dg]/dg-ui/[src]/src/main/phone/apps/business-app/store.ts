import { StoreObject } from '../../../../lib/redux';

const store: StoreObject<Phone.Business.State> = {
  key: 'phone.apps.business',
  initialState: {
    list: [],
    activeApp: 'business',
    currentBusiness: null,
    employees: [],
    roles: {},
    permissionLabels: {},
    logs: [],
  },
};

export default store;
