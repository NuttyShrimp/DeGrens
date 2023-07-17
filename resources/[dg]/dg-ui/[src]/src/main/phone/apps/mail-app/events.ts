import { addNotification, isAppActive } from '../../lib';
import { usePhoneStore } from '../../stores/usePhoneStore';

import { useMailAppStore } from './stores/useMailAppStore';

export const events: Phone.Events = {};

events.addMail = (data: { mail: Phone.Mail.Mail | Phone.Mail.Mail[]; skipNotification: boolean }) => {
  const newMails = Array.isArray(data.mail) ? data.mail : [data.mail];

  useMailAppStore.setState(s => ({
    mails: [...new Map([...newMails, ...s.mails].map(x => [x.id, x])).values()].sort((a, b) => b.date - a.date),
  }));

  if (!data.skipNotification) {
    if (!isAppActive('mail')) {
      usePhoneStore.setState(s => ({ appNotifications: [...s.appNotifications, 'mail'] }));
    }

    for (const m of newMails) {
      addNotification({
        id: `mail_${m.id}`,
        icon: 'mail',
        title: `Email`,
        description: m.subject,
        app: 'mail',
      });
    }
  }
};
