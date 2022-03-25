import { nuiAction } from '../../../../lib/nui-comms';
import { addNotification } from '../../lib';
import { getContact } from '../contacts-app/lib';

export const events: Phone.Events = {};

events.doRequest = (data: { id: number; origin: string }) => {
  // Create notification & send nuiaction corresponding to the button clicked
  addNotification({
    id: `ping-${data.id}`,
    icon: 'pinger',
    title: 'Binnenkomende ping',
    description: `From ${getContact(data.origin)?.label ?? data.origin}`,
    timer: 30,
    onAccept: () => {
      nuiAction('phone/pinger/accept', { id: data.id });
    },
    onDecline: () => {
      nuiAction('phone/pinger/decline', { id: data.id });
    },
  });
};
