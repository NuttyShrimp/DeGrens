import { create } from '@src/lib/store';

export const useBusinessAppStore = create<Phone.Business.State & Store.UpdateStore<Phone.Business.State>>(
  'phone.app.business'
)(set => ({
  list: [],
  activeApp: 'business',
  currentBusiness: null,
  employees: [],
  roles: {},
  permissionLabels: {},
  logs: [],
  updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
}));
