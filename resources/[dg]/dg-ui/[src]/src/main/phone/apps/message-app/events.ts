import { addNotification, genericAction, isAppActive } from '../../lib';
import { getContact } from '../contacts-app/lib';

import { addMessage } from './lib';

let msgId = 1;

export const events: Phone.Events = {};

events.addNew = (data: { message: Phone.Messages.Message; otherPhone: string }) => {
  addMessage(data.otherPhone, [data.message], 'append');
  if (data.message.isreceiver) {
    addNotification({
      id: `msg-${msgId++}`,
      title: getContact(data.otherPhone ?? '')?.label ?? data.otherPhone,
      description: data.message.message,
      icon: 'messages',
      app: 'messages',
    });
  }
  if (isAppActive('messages')) return;
  genericAction('phone.apps.messages', {
    hasNotification: true,
  });
};
