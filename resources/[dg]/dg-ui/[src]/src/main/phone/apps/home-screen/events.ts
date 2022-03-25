import { acceptNotification, addNotification, getState, removeNotification, updateNotification } from '../../lib';

export const events: Phone.Events = {};

events.addNotification = (noti: Phone.Notifications.Notification) => {
  addNotification(noti);
};
events.removeNotification = (id: string) => {
  removeNotification(id);
};
events.updateNotification = (data: { id: string; notification: Phone.Notifications.Notification }) => {
  updateNotification(data.id, data.notification);
};
events.acceptNotification = () => {
  const notis = getState<Phone.Notifications.State>('phone.notifications');
  const acceptableNoti = notis.list.find(n => n.onAccept);
  if (!acceptableNoti) return;
  acceptNotification(acceptableNoti.id);
};
events.declineNotification = () => {
  const notis = getState<Phone.Notifications.State>('phone.notifications');
  const acceptableNoti = notis.list.find(n => n.onDecline);
  if (!acceptableNoti) return;
  acceptNotification(acceptableNoti.id);
};
