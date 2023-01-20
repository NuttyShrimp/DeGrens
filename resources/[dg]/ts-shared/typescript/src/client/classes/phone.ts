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

  sendMail(subject: string, sender: string, mail: string) {
    global.exports['dg-phone'].sendMail(subject, sender, mail);
  }
}

export default {
  Phone: new Phone(),
};
