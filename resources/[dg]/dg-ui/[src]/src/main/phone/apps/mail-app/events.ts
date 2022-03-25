import { addNotification, genericAction, getState } from '../../lib';

export const events: Phone.Events = {};

let mailId = 0;

events.newMail = (mail: Partial<Phone.Mail.Mail>) => {
  const mailState = getState<Phone.Mail.State>('phone.apps.mail');
  mail.id = `mail-${mailId++}`;
  mail.date = Date.now();
  mailState.mails.push(mail as Phone.Mail.Mail);
  genericAction('phone.apps.mail', mailState);
  addNotification({
    id: `mail_${mail.id}`,
    icon: 'mail',
    title: `Email`,
    description: mail.subject ?? 'New email',
    app: 'mail',
  });
};
