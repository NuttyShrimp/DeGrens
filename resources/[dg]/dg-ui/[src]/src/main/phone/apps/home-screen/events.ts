import { acceptNotification, addNotification, removeNotification, updateNotification } from '../../lib';
import { usePhoneNotiStore } from '../../stores/usePhoneNotiStore';

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
  const notis = usePhoneNotiStore.getState();
  const acceptableNoti = notis.list.find(n => n.onAccept);
  if (!acceptableNoti) return;
  acceptNotification(acceptableNoti.id);
};
events.declineNotification = () => {
  const notis = usePhoneNotiStore.getState();
  const acceptableNoti = notis.list.find(n => n.onDecline);
  if (!acceptableNoti) return;
  acceptNotification(acceptableNoti.id);
};
