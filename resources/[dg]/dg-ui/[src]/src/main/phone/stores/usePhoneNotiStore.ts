import { create } from '@src/lib/store';

export const usePhoneNotiStore = create<Phone.Notifications.State>('phone.notifications')(() => ({
  list: [],
}));
