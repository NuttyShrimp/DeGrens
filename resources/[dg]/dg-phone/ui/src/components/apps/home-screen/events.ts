import { State, store } from '../../../lib/state';
import { PhoneNotification } from '../../../types/notifications';
import { initPhoneApps } from '../../../lib/apps';
import { setResourceName } from '../../../lib/nui';

export const events: any = {};

events.addNotification = (noti: PhoneNotification) => {
	store.dispatch('addNotification', noti);
};

events.removeNotification = (id: string) => {
	store.commit('removeNotification', id);
};

events.updateNotification = (data: { id: string; notification: PhoneNotification }) => {
	store.commit('updateNotification', {
		id: data.id,
		data: data.notification,
	});
};

events.acceptNotification = () => {
	// Get first notification with accept action
	const notification = store.getters
		.getAppState('notifications')
		.find((noti: PhoneNotification) => noti.onAccept !== undefined);
	if (!notification) return;
	store.commit('acceptNotification', notification.id);
};

events.declineNotification = () => {
	// Get first notification with decline action
	const notification = store.getters
		.getAppState('notifications')
		.find((noti: PhoneNotification) => noti.onDecline !== undefined);
	if (!notification) return;
	store.commit('declineNotification', notification.id);
};

events.setCharacterData = (data: State['character']) => {
	const { character } = store.state;
	store.commit('setAppState', {
		appName: 'character',
		data: {
			...character,
			...data,
		},
	});
};

events.setOpenState = (state: State['open']) => {
	store.commit('setAppState', {
		appName: 'open',
		data: state,
	});
};

events.doInit = (res: string) => {
	setResourceName(res);
	initPhoneApps();
};

events.doReload = () => {
	window.location.reload();
};
