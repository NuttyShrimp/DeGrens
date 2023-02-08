import { addNotification, isAppActive } from '../../lib';
import { usePhoneStore } from '../../stores/usePhoneStore';

import { useMailAppStore } from './stores/useMailAppStore';

export const events: Phone.Events = {};

let mailId = 0;

events.newMail = (mailData: Phone.Mail.MailData) => {
  const newMail = {
    ...mailData,
    id: `mail-${mailId++}`,
    date: Date.now(),
  };

  useMailAppStore.setState(s => ({
    mails: [newMail, ...s.mails],
  }));

  if (!isAppActive('mail')) {
    usePhoneStore.setState(s => ({ appNotifications: [...s.appNotifications, 'mail'] }));
  }
  addNotification({
    id: `mail_${newMail.id}`,
    icon: 'mail',
    title: `Email`,
    description: newMail.subject ?? 'New email',
    app: 'mail',
  });
};
