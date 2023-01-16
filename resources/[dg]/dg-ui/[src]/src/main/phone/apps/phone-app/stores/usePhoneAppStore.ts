import { create } from '@src/lib/store';

export const usePhoneAppStore = create<Phone.Phone.State>('phone.app.phone')(() => ({
  calls: [],
}));
