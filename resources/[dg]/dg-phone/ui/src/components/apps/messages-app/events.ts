import { Message } from '../../../types/apps';
import { store } from '../../../lib/state';
import { getContact } from '../contacts/lib';

export const events: any = {};
let msgId = 0;
events.addNew = (data: { message: Message; otherPhone?: string }) => {
	store.commit('addMessage', {
		messages: [data.message],
		id: data.otherPhone,
		place: 'append',
	});
	if (data.message.isreceiver) {
		store.dispatch('addNotification', {
			id: msgId++,
			title: getContact(data.otherPhone ?? '')?.label ?? data.otherPhone,
			description: data.message.message,
			icon: 'messages',
		});
	}
};
