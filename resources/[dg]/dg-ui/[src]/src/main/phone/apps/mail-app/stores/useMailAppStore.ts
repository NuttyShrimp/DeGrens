import { create } from '@src/lib/store';

export const useMailAppStore = create<Phone.Mail.State & Phone.Mail.StateActions>('phone.app.mails')(set => ({
  mails: [],
  removeMail: id => set(state => ({ mails: state.mails.filter(mail => mail.id !== id) })),
}));
