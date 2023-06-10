import { UI } from '@dgx/client';
import { getState } from './state';

// used to restore sticky notifs on reload
const stickyNotifCache: Record<string, Phone.Notification> = {}; // key: notifId, value: notifData

UI.RegisterUICallback('phone/notifications/event', (data: { event: string; isAccept: boolean; data: any }, cb) => {
  emitNotificationEvent(data.event, data.isAccept, data.data);

  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

const emitNotificationEvent = (event: string, isAccept: boolean, eventData: unknown) => {
  // check if events starts with server:
  if (event.startsWith('server:')) {
    emitNet(event.replace('server:', ''), eventData, isAccept);
  } else {
    emit(event, eventData, isAccept);
  }
};

// function addNotification
// Adds notification to phone (normally stays for 8 seconds
// if action is needed time will be extended to 30 seconds)
const addNotification = (notification: Phone.Notification) => {
  if (!getState('hasPhone')) {
    // if player doesn't have phone, auto decline
    if (notification.onDecline) {
      emitNotificationEvent(notification.onDecline, false, {});
    }
    return;
  }
  if (notification.onAccept || notification.onDecline) {
    PlaySound(-1, 'Click_Fail', 'WEB_NAVIGATION_SOUNDS_PHONE', false, 0, true);
  }
  if (notification.sticky) {
    stickyNotifCache[notification.id] = notification;
  }
  UI.SendAppEvent('phone', {
    appName: 'home-screen',
    action: 'addNotification',
    data: notification,
  });
};

exports('addNotification', addNotification);
onNet('dg-phone:client:notification:add', addNotification);

const removeNotification = (id: number) => {
  delete stickyNotifCache[id];

  UI.SendAppEvent('phone', {
    appName: 'home-screen',
    action: 'removeNotification',
    data: id,
  });
};

exports('removeNotification', removeNotification);
onNet('dg-phone:client:notification:remove', removeNotification);

// Update a existing notification
// @param id string
// @param notification table
// notification is same structure as above
// The diff between them is that this each element of this table is optional
const updateNotification = (id: number, noti: Partial<Phone.Notification>) => {
  if (stickyNotifCache[id]) {
    stickyNotifCache[id] = {
      ...stickyNotifCache[id],
      ...noti,
    };
  }
  UI.SendAppEvent('phone', {
    appName: 'home-screen',
    action: 'updateNotification',
    data: {
      id: id,
      notification: noti,
    },
  });
};

exports('updateNotification', updateNotification);
onNet('dg-phone:client:notification:update', updateNotification);

export const restoreStickyNotifs = () => {
  for (const id in stickyNotifCache) {
    const notif = stickyNotifCache[id];
    addNotification(notif);
  }
};
