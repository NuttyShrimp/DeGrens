import { store } from '../../../lib/state';
import { PhoneNotification } from '../../../types/notifications';
import { Note } from '../../../types/apps';
import { nuiAction } from '../../../lib/nui';

export const events: any = {};

events.share = (data: { note: Note; id: number }) => {
	const notification: PhoneNotification = {
		id: `note-${data.id}`,
		icon: 'notes',
		title: 'View Note',
		description: `a note is being shared`,
		onAccept: async (notiData: { id: number; note: Note }) => {
			const noteId = await nuiAction('notes/resolveShare', {
				id: notiData.id,
				accepted: true,
			});
			if (typeof noteId === 'number') {
				notiData.note.id = noteId;
			}
			store.commit('setCurrentEntry', { appName: 'notes', entry: notiData.note });
			store.commit('setActiveApp', 'notes');
		},
		onDecline: (notiData: { id: number }) => {
			nuiAction('notes/resolveShare', {
				id: notiData.id,
				accepted: false,
			});
		},
		timer: 30,
		_data: {
			id: data.id,
			note: data.note,
		},
		actionWithRemove: true,
	};
	store.dispatch('addNotification', notification);
};
