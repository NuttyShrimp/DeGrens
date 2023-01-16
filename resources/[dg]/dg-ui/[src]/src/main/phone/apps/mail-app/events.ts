import { addNotification, isAppActive } from '../../lib';
import { usePhoneStore } from '../../stores/usePhoneStore';

import { useMailAppStore } from './stores/useMailAppStore';

export const events: Phone.Events = {};

let mailId = 0;

events.newMail = (mail: Partial<Phone.Mail.Mail>) => {
  const mailState = useMailAppStore.getState();
  mail.id = `mail-${mailId++}`;
  mail.date = Date.now();
  mailState.mails.push(mail as Phone.Mail.Mail);
  if (!isAppActive('mail')) {
    usePhoneStore.setState(s => ({ appNotifications: [...s.appNotifications, 'mail'] }));
  }
  useMailAppStore.setState(mailState);
  addNotification({
    id: `mail_${mail.id}`,
    icon: 'mail',
    title: `Email`,
    description: mail.subject ?? 'New email',
    app: 'mail',
  });
};
