import { create } from '@src/lib/store';

export const useMailAppStore = create<Phone.Mail.State>('phone.app.mails')(() => ({
  mails: [],
}));
