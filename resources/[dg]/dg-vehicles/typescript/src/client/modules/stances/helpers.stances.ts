import { Notifications } from '@dgx/client';
import { NOTIFICATION_ID } from './constants.stances';

export const roundOffset = (offset: number) => Math.round(offset * 200) / 200;

export const updateInfoNotif = (text: string) => {
  removeInfoNotif();
  Notifications.add(text, 'info', undefined, true, NOTIFICATION_ID);
};

export const removeInfoNotif = () => Notifications.remove(NOTIFICATION_ID);
