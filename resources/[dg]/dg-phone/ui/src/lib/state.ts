import { createStore, Store, useStore as baseUseStore } from 'vuex';
// @ts-ignore
import { DefineComponent, InjectionKey } from 'vue';
import {
	CallHistoryEntry,
	Contact,
	GalleryEntry,
	infoAppEntry,
	JusticePerson,
	Mail,
	Message,
	Note,
	Tweet,
	YellowPageEntry,
} from '../types/apps';
import { PhoneNotification, PhoneNotificationIcon } from '../types/notifications';
import { nuiAction } from './nui';
import { devDataPlugin } from './devdata';
import { phoneApps } from './apps';
import backgroundImg from '@/assets/background.png';

export interface State {
	open: boolean;
	hasNotification: boolean;
	activeApp: string;
	callMeta: Record<string, unknown>;
	time: string;
	isSilenced: boolean;
	events: Record<string, Record<string, (data: any) => void>>;
	modal: {
		visible: boolean;
		element: DefineComponent | null;
		props: Record<string, any>;
		checkmark: boolean;
	};
	bigPicture: string | undefined;
	background: Partial<CSSStyleDeclaration>;
	notifications: PhoneNotification[];
	character: {
		server_id: number;
		cid: string;
		firstname: string;
		lastname: string;
		job: string;
		phone: string;
		permissionGroup: string;
		background: string;
		hasVPN: boolean;
	};
	// sRecord<string, unknown>;tate binded to apps
	info: infoAppEntry[];
	contacts: Contact[];
	phone: {
		currentView: 'history' | 'dailpad';
		history: CallHistoryEntry[];
	};
	messages: {
		currentView: 'list' | string;
		messages: Record<string, Message[]>;
	};
	twitter: {
		recBatches: number;
		tweets: Tweet[];
	};
	yellowpages: {
		current: YellowPageEntry | null;
		list: YellowPageEntry[];
	};
	mail: Mail[];
	notes: {
		current: Note | null;
		list: Note[];
	};
	gallery: GalleryEntry[];
	justice: Record<string, JusticePerson[]>;
}

export const key: InjectionKey<Store<State>> = Symbol();

const backgroundURL = `url(${backgroundImg})`;

export const store = createStore<State>({
	state: {
		open: false,
		hasNotification: false,
		activeApp: 'home-screen',
		callMeta: {},
		time: '12:00',
		isSilenced: false,
		character: {
			server_id: 0,
			cid: '',
			firstname: '',
			lastname: '',
			phone: '',
			job: '',
			permissionGroup: '',
			background: '',
			hasVPN: false,
		},
		// Registered events
		events: {},
		modal: {
			visible: false,
			element: null,
			props: {},
			checkmark: false,
		},
		bigPicture: undefined,
		background: {},
		notifications: [],
		info: [],
		contacts: [],
		phone: {
			currentView: 'history',
			history: [],
		},
		messages: {
			currentView: 'list',
			messages: {},
		},
		twitter: {
			recBatches: 0,
			tweets: [],
		},
		mail: [],
		yellowpages: {
			current: null,
			list: [],
		},
		notes: {
			current: null,
			list: [],
		},
		gallery: [],
		justice: {},
	},
	getters: {
		getAppState: state => (appName: keyof State) => state[appName],
		getNotification: state => (id: string) => {
			return state.notifications.find(n => n.id === id);
		},
		getAllMessages: state => () => {
			return state.messages.messages;
		},
		getMessages: state => () => {
			if (state.messages.currentView === 'list') {
				return [];
			}
			if (!state.messages.messages[state.messages.currentView]) {
				return [];
			}
			return state.messages.messages[state.messages.currentView] || [];
		},
		getHasVPN: state => () => {
			return state.character.hasVPN;
		},
	},
	mutations: {
		setActiveApp(state, app: string) {
			store.commit('setBackground', app);
			state.activeApp = app;
		},
		setAppState(state: State, payload: { appName: keyof State; data: any }) {
			// @ts-ignore
			state[payload.appName] = payload.data;
			if (payload.appName === 'character') {
				store.commit('setBackground');
			}
		},
		setBackground(state: State, app: string) {
			app = app ?? state.activeApp;
			const getStandardBackground = () => {
				const charBG = state.character.background;
				return {
					background: (charBG && charBG.trim() !== '' ? state.character.background : backgroundURL) || backgroundURL,
				};
			};
			if (!phoneApps || !phoneApps[app]?.background) {
				state.background = getStandardBackground();
			}
			state.background =
				phoneApps[app].background === 'transparent'
					? getStandardBackground()
					: typeof phoneApps[app].background === 'string'
					? { background: phoneApps[app].background as string }
					: (phoneApps[app].background as Required<State['background']>);
		},
		setEventsForApp(state: State, payload: { name: string; evts: Record<string, (data: any) => void> }) {
			state.events[payload.name] = payload.evts;
		},
		addNotification(state: State, payload: PhoneNotification) {
			const _notis = [...(state.notifications ?? [])];
			_notis.unshift(payload);
			state.notifications = _notis;
			if (state.isSilenced) return;
			state.hasNotification = true;
		},
		removeNotification(state: State, payload: string) {
			state.notifications = state.notifications.filter(notification => notification.id !== payload);
			if (state.notifications.length === 0) {
				state.hasNotification = false;
			}
		},
		updateNotification(state: State, payload: { id: string; data: any }) {
			const index = state.notifications.findIndex(notification => notification.id === payload.id);
			if (index !== -1) {
				state.notifications[index] = { ...state.notifications[index], ...payload.data };
			}
		},
		acceptNotification(state: State, payload: string) {
			const index = state.notifications.findIndex(notification => notification.id === payload);
			if (index === -1) return;
			const notification = state.notifications[index];
			(notification?.onAccept as Function)?.(notification._data);
			if (notification?.sticky || notification.actionWithRemove == false) return;
			store.commit('removeNotification', notification.id);
		},
		declineNotification(state: State, payload: string) {
			const index = state.notifications.findIndex(notification => notification.id === payload);
			if (index === -1) return;
			const notification = state.notifications[index];
			(notification?.onDecline as Function)?.(notification._data);
			if (notification?.sticky || notification.actionWithRemove == false) return;
			store.commit('removeNotification', notification.id);
		},
		addCallHistoryEntry(state: State, payload: CallHistoryEntry) {
			if (!state.phone) {
				state.phone = {
					currentView: 'history',
					history: [],
				};
			}
			const _history = [...(state.phone.history ?? []), payload];
			state.phone.history = _history;
		},
		setCurrentView(state: State, payload: { appName: keyof State; view: string }) {
			// @ts-ignore
			state[payload.appName].currentView = payload.view;
		},
		setCurrentEntry(state: State, payload: { appName: keyof State; entry: any }) {
			// @ts-ignore
			state[payload.appName].current = payload.entry;
		},
		addMessage(
			state: State,
			payload: { id: string; messages: Message[]; place?: 'append' | 'prepend'; reset?: boolean }
		) {
			if (!state.messages.messages) {
				state.messages.messages = {};
			}
			if (payload.reset) {
				state.messages.messages[payload.id] = payload.messages;
			} else {
				switch (payload.place) {
					case 'append': {
						state.messages.messages[payload.id] = [...(state.messages.messages[payload.id] || []), ...payload.messages];
						break;
					}
					case 'prepend': {
						state.messages.messages[payload.id] = [...payload.messages, ...(state.messages.messages[payload.id] || [])];
						break;
					}
					default: {
						break;
					}
				}
			}
		},
		addNewTweets(state: State, payload: Tweet[] | Tweet) {
			if (!state.twitter) {
				state.twitter = {
					recBatches: 0,
					tweets: [],
				};
			}
			if (Array.isArray(payload)) {
				state.twitter.tweets = [...state.twitter.tweets, ...payload.reverse()];
				state.twitter.recBatches++;
			} else {
				state.twitter.tweets = [payload, ...state.twitter.tweets];
			}
		},
		likeTweet(state: State, payload: { tweetId: number; liked: boolean }) {
			const index = state.twitter.tweets.findIndex(tweet => tweet.id === payload.tweetId);
			if (index !== -1) {
				state.twitter.tweets[index].liked = payload.liked;
			}
		},
		setTweetRetweeted(state: State, payload: { tweetId: number }) {
			const index = state.twitter.tweets.findIndex(tweet => tweet.id === payload.tweetId);
			if (index !== -1) {
				state.twitter.tweets[index].retweeted = true;
			}
		},
		updateTweetStatus(state: State, payload: { tweetId: number; action: string }) {
			const tweets: Tweet[] = Array.isArray(state.twitter.tweets)
				? state.twitter.tweets
				: Object.values(state.twitter.tweets);
			const index = tweets.findIndex(tweet => tweet.id === payload.tweetId);
			if (index !== -1) {
				switch (payload.action) {
					case 'addLike': {
						state.twitter.tweets[index].like_count++;
						break;
					}
					case 'removeLike': {
						state.twitter.tweets[index].like_count--;
						break;
					}
					case 'addRetweet': {
						state.twitter.tweets[index].retweet_count++;
						break;
					}
					default: {
						break;
					}
				}
			} else {
				console.warn(`couldn't find tweet with id: ${payload}`);
			}
		},
		deleteTweet(state: State, payload: number) {
			state.twitter.tweets = state.twitter.tweets.filter(tweet => tweet.id !== payload);
		},
		setActiveYP(state: State, payload: YellowPageEntry) {
			state.yellowpages.current = payload;
		},
		setSilenced(state: State, payload: boolean) {
			console.log('set silenced', payload);
			state.isSilenced = payload;
			nuiAction('phone/silence', {
				silenced: payload,
			});
		},
	},
	actions: {
		openModal(context, payload: { element: DefineComponent; props: Record<string, any> }) {
			context.commit('setAppState', {
				appName: 'modal',
				data: {
					visible: true,
					element: payload.element,
					props: payload.props,
					checkmark: false,
				},
			});
		},
		closeModal(context) {
			context.commit('setAppState', {
				appName: 'modal',
				data: {
					visible: false,
					element: null,
					props: {},
					checkmark: false,
				},
			});
		},
		openCheckmarkModal(context, payload?: Function) {
			context.commit('setAppState', {
				appName: 'modal',
				data: {
					visible: false,
					element: null,
					props: {},
					checkmark: true,
				},
			});
			setTimeout(() => {
				context.dispatch('closeModal');
				if (!payload) return;
				payload();
			}, 2000);
		},
		addNotification(context, payload: PhoneNotification) {
			if (typeof payload.icon === 'string') {
				if (!phoneApps[payload.icon]) {
					console.error(`App: ${payload.icon} doesn't exists | noti-id: ${payload.id}`);
					return;
				}
				payload.icon = phoneApps[payload.icon].icon as PhoneNotificationIcon;
			}
			let cd = 8000;
			if (payload.onAccept || payload.onDecline)
				cd = payload?.timer && payload?.timer > 0 ? payload.timer * 1000 : 30000;
			if (typeof payload?.onAccept == 'string') {
				const eventName = payload.onAccept;
				payload.onAccept = (_data: any) =>
					nuiAction('notifications/event', {
						event: eventName,
						data: _data,
					});
			}
			if (typeof payload?.onDecline == 'string') {
				const eventName = payload.onDecline;
				payload.onDecline = (_data: any) => {
					nuiAction('notifications/event', {
						event: eventName,
						data: _data,
					});
				};
			}
			context.commit('addNotification', payload);
			if (payload.sticky) return;
			setTimeout(() => {
				// Check if notification still exists
				const idx = context.getters
					.getAppState('notifications')
					.find((noti: PhoneNotification) => noti.id === payload.id);
				if (!idx) return;
				context.commit('removeNotification', payload.id);
				if (payload.onDecline) (payload.onDecline as Function)();
			}, cd);
		},
		async openMsgConvo(context, payload: string) {
			// get the messages for this convo
			const messages =
				(await nuiAction('messages/get', {
					target: payload,
					offset: 0,
				})) ?? {};
			context.commit('addMessage', {
				id: payload,
				messages: messages?.[payload] ?? [],
				place: 'prepend',
				reset: true,
			});
			context.commit('setCurrentView', {
				appName: 'messages',
				view: payload,
			});
			context.commit('setActiveApp', 'messages');
		},
		addTweet(context, payload: Tweet) {
			context.commit('addNewTweets', payload);
			if (
				`${context.state.character.firstname}_${context.state.character.lastname}`.replace('', '_') ===
				payload.sender_name
			)
				return;
			const twtNotification: PhoneNotification = {
				id: `tweet_${payload.id}`,
				icon: 'twitter',
				title: `${payload.sender_name} tweeted`,
				description: payload.tweet,
			};
			context.dispatch('addNotification', twtNotification).then();
		},
		addMail(context, payload: Mail) {
			payload.id = context.state.mail.length;
			payload.date = Date.now();
			context.commit('setAppState', {
				appName: 'mail',
				data: [payload, ...context.getters.getAppState('mail')],
			});
			const twtNotification: PhoneNotification = {
				id: `mail_${payload.id}`,
				icon: 'mail',
				title: `Email`,
				description: payload.subject,
			};
			context.dispatch('addNotification', twtNotification).then();
		},
		deleteNote(context) {
			const note = context.state.notes.current;
			if (!note) return;
			nuiAction('notes/delete', {
				id: note.id,
			});
			context.state.notes.list = context.state.notes.list.filter(n => n.id !== note.id);
			context.state.notes.current = null;
		},
		async createNote(context) {
			const newNote = await nuiAction('notes/new', {
				title: 'New Note',
				note: '',
				date: Date.now(),
			});
			context.state.notes.list = [newNote, ...context.state.notes.list];
			context.state.notes.current = newNote;
		},
	},
	plugins: [devDataPlugin],
});

export function useStore() {
	return baseUseStore(key);
}
