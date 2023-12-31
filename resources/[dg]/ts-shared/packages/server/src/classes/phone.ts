class Phone {
  /**
   * A promise wrapper for a phone notification request
   * Returns a promise that returns a boolean which represents if it was accepted(true) or declined(false)
   */
  async notificationRequest(target: number, notification: Phone.Notification): Promise<boolean> {
    return new Promise(res => {
      // Handle the incoming events
      const acceptEvt = `__dg_shared_accept_${notification.id}`;
      onNet(acceptEvt, () => {
        res(true);
      });
      const declineEvt = `__dg_shared_decline_${notification.id}`;
      onNet(declineEvt, () => {
        res(false);
      });
      emitNet('dg-phone:client:notification:add', target, {
        ...notification,
        onAccept: `server:${acceptEvt}`,
        onDecline: `server:${declineEvt}`,
      });
    });
  }

  /**
   * Show a notification on the phone
   */
  showNotification(target: number, notification: Phone.Notification) {
    emitNet('dg-phone:client:notification:add', target, notification);
  }

  removeNotification(target: number, id: string) {
    emitNet('dg-phone:client:notification:remove', target, id);
  }

  updateNotification(target: number, id: string, notification: Partial<Phone.Notification>) {
    emitNet('dg-phone:client:notification:update', target, id, notification);
  }

  addMail(plyId: number, mailData: Phone.Mails.MailData) {
    global.exports['dg-phone'].addMail(plyId, mailData);
  }

  addOfflineMail(cid: number, mailData: Phone.Mails.MailData): Promise<void> {
    return global.exports['dg-phone'].addOfflineMail(cid, mailData);
  }

  onPlayerCalledNumber = (cb: (plyId: number, phoneNumber: string, type: 'normal' | 'anon' | 'prison') => void) => {
    on('phone:calls:started', cb);
  };
}

export default {
  Phone: new Phone(),
};
