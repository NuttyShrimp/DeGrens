import { create } from '@src/lib/store';

export const useContactAppStore = create<Phone.Contacts.State>('phone.app.contact')(() => ({
  contacts: [],
}));
