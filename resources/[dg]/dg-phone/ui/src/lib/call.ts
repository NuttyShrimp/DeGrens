import { nuiAction } from './nui';
import { PhoneNotification } from '../types/notifications';
import { getContact } from '../components/apps/contacts/lib';
import { store } from './state';

const phoneCallNotiId = Math.random().toString(36).substring(2);
let incoming = false;

export const formatTime = (time: number): string => {
	const sec = Math.floor(time % 60);
	const min = Math.floor(time / 60);
	return `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
};

export const startPhoneCall = (nr: string, isAnon = false) => {
	nuiAction('phone:startCall', {
		phone: nr,
		isAnon,
	});
	store.commit('setAppState', {
		appName: 'callMeta',
		data: {
			number: nr,
			isAnon,
		},
	});
	const notifcation: PhoneNotification = {
		id: phoneCallNotiId,
		title: getContact(nr)?.label ?? nr,
		description: 'Calling...',
		icon: 'dialer',
		sticky: true,
		onDecline: () => {
			// Event tries to end current call server sided, if any
			nuiAction('phone:dispatchEndCall');
		},
	};
	store.dispatch('addNotification', notifcation).then();
};

export const endPhoneCall = () => {
	// Event does not end the call on other end just does cleanup
	store.commit('updateNotification', {
		id: phoneCallNotiId,
		data: {
			description: 'Call ended',
		},
	});
	nuiAction('phone:endcall');
	store.commit('removeNotification', phoneCallNotiId);
	const callMeta = store.getters.getAppState('callMeta');
	const contact = getContact(callMeta.number);
	if (!callMeta.isAnon) {
		store.commit('addCallHistoryEntry', {
			name: contact?.label ?? callMeta.number,
			number: contact?.phone ?? '',
			date: Date.now(),
			incoming,
		});
	}
	store.commit('setAppState', {
		appName: 'callMeta',
		data: {},
	});
	incoming = false;
};

export const setIncomingCall = (data: { label: string; isAnon: boolean }) => {
	incoming = true;
	const contact = getContact(data.label);
	store.commit('setAppState', {
		appName: 'callMeta',
		data: {
			number: data.label,
			isAnon: data.isAnon,
		},
	});
	store.dispatch('addNotification', {
		id: phoneCallNotiId,
		title: contact?.label ?? data.label,
		description: 'Incoming call...',
		icon: 'dialer',
		actionWithRemove: false,
		sticky: true,
		onAccept: () => {
			nuiAction('phone:acceptCall');
		},
		onDecline: () => {
			nuiAction('phone:declineCall');
		},
	});
};

export const setActiveCall = () => {
	const timer = 0;
	store.commit('updateNotification', {
		id: phoneCallNotiId,
		data: {
			description: 'in call...',
			timer: 0,
			onAccept: undefined,
		},
	});
};
