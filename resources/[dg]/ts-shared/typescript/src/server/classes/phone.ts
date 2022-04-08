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
      const declineEvt = `__dg_shared_accept_${notification.id}`;
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
}

export default {
  Phone: new Phone(),
};
