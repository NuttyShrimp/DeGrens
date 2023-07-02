import { UI } from '@dgx/client';

const cachedMails: Mail[] = [];

const sendMail = (subject: string, sender: string, message: string, dontCache = true) => {
  const mailData: Mail = {
    subject: subject,
    sender: sender,
    message: message,
  };

  if (!dontCache) {
    cachedMails.push(mailData);
  }

  UI.SendAppEvent('phone', {
    appName: 'mail',
    action: 'newMail',
    data: mailData,
  });
};

exports('sendMail', sendMail);

onNet('phone:mail:add', sendMail);

export const restoreCachedMails = () => {
  UI.SendAppEvent('phone', {
    appName: 'mail',
    action: 'restore',
    data: cachedMails,
  });
};
