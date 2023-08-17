import { Events } from './index';

class Phone {
  showNotification(notification: Phone.Notification) {
    global.exports['dg-phone'].addNotification(notification);
  }

  removeNotification(id: string) {
    global.exports['dg-phone'].removeNotification(id);
  }

  updateNotification(id: string, notification: Partial<Phone.Notification>) {
    global.exports['dg-phone'].removeNotification(id, notification);
  }

  addMail(mailData: Phone.Mails.MailData) {
    Events.emitNet('phone:mails:add', mailData);
  }
}

export default {
  Phone: new Phone(),
};
