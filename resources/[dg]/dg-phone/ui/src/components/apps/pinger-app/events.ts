import { store } from '../../../lib/state';
import { getContact } from '../contacts/lib';
import { nuiAction } from '../../../lib/nui';

export const events: any = {};

events.doRequest = (data: { id: number; origin: string }) => {
	// Create notification & send nuiaction corresponding to the button clicked
	store.dispatch('addNotification', {
		id: `ping-${data.id}`,
		icon: 'pinger',
		title: 'Incoming ping',
		description: `From ${getContact(data.origin)?.label ?? data.origin}`,
		timer: 30,
		onAccept: () => {
			nuiAction('pinger/accept', { id: data.id });
		},
		onDecline: () => {
			nuiAction('pinger/decline', { id: data.id });
		},
	});
};
