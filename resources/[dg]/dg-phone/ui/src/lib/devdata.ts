import { State, store } from './state';
import { emulate } from './nui';
import { CallHistoryEntry, Mail, Message, Note, YellowPageEntry } from '../types/apps';
import { Store } from 'vuex';

export const devdata: Record<string, any> = {};
export const setDevData = (key: keyof State) => {
	if (process.env.NODE_ENV !== 'development') return;
	if (!devdata[key]) return;
	store.commit('setAppState', {
		appName: key,
		data: devdata[key],
	});
};

devdata.contacts = [
	{
		id: 1,
		label: 'John Doe',
		phone: '0467227521',
	},
	{
		id: 2,
		label: 'Jane Doe',
		phone: '0467227522',
	},
	{
		id: 3,
		label: 'Jack Doe',
		phone: '0467227523',
	},
	{
		id: 4,
		label: 'Jill Doe',
		phone: '0467227524',
	},
	{
		id: 5,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 6,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 7,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 8,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 9,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 10,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 11,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 12,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 13,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 14,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 15,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 16,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 17,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
	{
		id: 18,
		label: 'Jenny Doe',
		phone: '0467227525',
	},
];
devdata.phone = {
	currentView: 'history',
	history: [
		{
			name: 'John Doe',
			number: '0467227521',
			incoming: true,
			date: 1638488727,
		},
		{
			name: 'John Doe',
			number: '0467227521',
			incoming: false,
			date: 1638488727,
		},
	],
} as {
	currentView: 'history' | 'dailpad';
	history: CallHistoryEntry[];
};
devdata.messages = {
	'0467227521': [
		{
			id: 1,
			isread: true,
			isreceiver: true,
			message: 'message 1',
			date: 1638488727,
		},
		{
			id: 2,
			isread: true,
			isreceiver: false,
			message: 'message 2 look a this dog https://inspyrus.com/wp-content/uploads/2016/08/cloud-image-1.jpg',
			date: 1638488900,
		},
		{
			id: 3,
			isread: false,
			isreceiver: true,
			message: 'message 3',
			date: 1638489000,
		},
		{
			id: 4,
			isread: false,
			isreceiver: false,
			message: 'message 4',
			date: 1638489100,
		},
		{
			id: 5,
			isread: false,
			isreceiver: true,
			message: 'message 5',
			date: 1638489200,
		},
		{
			id: 6,
			isread: false,
			isreceiver: false,
			message: 'message 6',
			date: 1638489300,
		},
		{
			id: 7,
			isread: false,
			isreceiver: true,
			message: 'message 7',
			date: 1638489400,
		},
		{
			id: 8,
			isread: false,
			isreceiver: false,
			message: 'message 8',
			date: 1638489500,
		},
		{
			id: 9,
			isread: false,
			isreceiver: true,
			message: 'message 9',
			date: 1638489600,
		},
		{
			id: 10,
			isread: false,
			isreceiver: false,
			message: 'message 10',
			date: 1638489700,
		},
		{
			id: 11,
			isread: false,
			isreceiver: true,
			message: 'message 11',
			date: 1638489800,
		},
		{
			id: 12,
			isread: false,
			isreceiver: false,
			message: 'message 12',
			date: 1638489900,
		},
		{
			id: 13,
			isread: false,
			isreceiver: true,
			message: 'message 13',
			date: 1638490000,
		},
		{
			id: 14,
			isread: false,
			isreceiver: false,
			message: 'message 14',
			date: 1638490100,
		},
		{
			id: 15,
			isread: false,
			isreceiver: true,
			message: 'message 15',
			date: 1638490300,
		},
		{
			id: 16,
			isread: false,
			isreceiver: false,
			message: 'message 16',
			date: 1638490400,
		},
		{
			id: 17,
			isread: false,
			isreceiver: true,
			message: 'message 17',
			date: 1638490500,
		},
	],
} as Record<string, Message[]>;

devdata.mail = [
	{
		id: 1,
		message:
			"This some long ass mail with special info you really need to know to have alot of money in the city bcs that's important",
		subject: 'Nothing special',
		sender: 'My cock',
		date: 1638488727,
	},
] as Mail[];

devdata.yellowpages = [
	{
		id: 1,
		phone: '0467227521',
		name: 'John Doe',
		text: 'My first ad https://inspyrus.com/wp-content/uploads/2016/08/cloud-image-1.jpg',
	},
	{
		id: 2,
		phone: '0467227522',
		name: 'Jane Doe',
		text: 'My Second super long ad with a nice emoji look --> 🚗 toet toet',
	},
] as YellowPageEntry[];

devdata.notes = [
	{
		id: 1,
		title: 'My first note',
		date: 1638488727,
		note: '<p>My test note</p>',
	},
	{
		id: 2,
		title: 'Contract',
		date: 1638489000,
		note: '<p>This is a contract with alot of restrictions and useless text nobody understands</p>',
	},
] as Note[];

devdata.gallery = [
	{
		id: 1,
		link: 'https://i.imgur.com/p2AF1tL.jpg',
	},
	{
		id: 2,
		link: 'https://i.imgur.com/TJvF3KT.jpg',
	},
	{
		id: 3,
		link: 'https://i.imgur.com/1W5Io9e.jpg',
	},
	{
		id: 4,
		link: 'https://i.imgur.com/bswBJPK.jpg',
	},
	{
		id: 5,
		link: 'https://i.imgur.com/ISeGfCO.jpg',
	},
	{
		id: 6,
		link: 'https://i.imgur.com/u2N5k3z.jpg',
	},
	{
		id: 7,
		link: 'https://i.imgur.com/Rho7WGc.jpg',
	},
	{
		id: 8,
		link: 'https://i.imgur.com/UAAoJ51.jpg',
	},
	{
		id: 9,
		link: 'https://i.imgur.com/HsUDGTh.jpg',
	},
	{
		id: 10,
		link: 'https://i.imgur.com/WVC05JR.jpg',
	},
] as State['gallery'];

devdata.justice = {
	judge: [
		{
			name: 'John doe',
			phone: '0467227521',
			available: true,
		},
		{
			name: 'David Achter',
			phone: '0487809321',
			available: true,
		},
	],
	lawyer: [
		{
			name: 'Jane doe',
			phone: '0467227522',
			available: false,
		},
	],
} as State['justice'];

const emulatedEvents: Record<
	string,
	{
		app: string;
		action: string;
		data: any;
		// If true data must be array & event will be triggered for each entry in the data array with the given action & app
		iterateData?: boolean;
	}
> = {};
export const devDataEmulator = () => {
	Object.keys(emulatedEvents).forEach(eventName => {
		const event = emulatedEvents[eventName];
		if (event.iterateData) {
			event.data.forEach((data: any) => {
				emulate(event.action, event.app, data);
			});
		} else {
			emulate(event.action, event.app, event.data);
		}
		console.log(`Emulated event: ${event.action} for ${event.app} (${eventName})`);
	});
};
devdata.twitter = {
	recBatches: 0,
	tweets: [
		{
			id: 1,
			sender_name: '@John_Doe',
			tweet: 'This is a tweet  https://i.redd.it/osiouuinz7881.jpg',
			date: 1638488727000,
			like_count: 2,
			retweet_count: 1,
			liked: false,
			retweeted: true,
		},
		{
			id: 2,
			sender_name: '@Jane_Doe',
			tweet: 'This is a tweet',
			date: 1638488727000,
			like_count: 11,
			retweet_count: 0,
			liked: true,
			retweeted: false,
		},
	],
} as State['twitter'];

emulatedEvents.setInfoEntries = {
	app: 'info',
	action: 'registerInfoEntry',
	iterateData: true,
	data: [
		{
			name: 'id',
			value: 183,
			icon: 'id-card',
			prefix: '#',
		},
		{
			name: 'phone',
			value: '0467227521',
			icon: 'hashtag',
			prefix: '',
		},
		{
			name: 'cash',
			value: 1672,
			icon: 'wallet',
			prefix: '€',
			color: '#81c784',
		},
		{
			name: 'bank',
			value: 12783790,
			icon: 'piggy-bank',
			prefix: '€',
			color: '#64b5f6',
		},
		{
			name: 'bank',
			value: 12783790,
			icon: 'piggy-bank',
			prefix: '€',
			color: '#64b5f6',
		},
		{
			name: 'bank',
			value: 12783790,
			icon: 'piggy-bank',
			prefix: '€',
			color: '#64b5f6',
		},
		{
			name: 'bank',
			value: 12783790,
			icon: 'piggy-bank',
			prefix: '€',
			color: '#64b5f6',
		},
		{
			name: 'bank',
			value: 12783790,
			icon: 'piggy-bank',
			prefix: '€',
			color: '#64b5f6',
		},
		{
			name: 'bank',
			value: 12783790,
			icon: 'piggy-bank',
			prefix: '€',
			color: '#64b5f6',
		},
	],
};
emulatedEvents.setCharacterData = {
	app: 'home-screen',
	action: 'setCharacterData',
	data: {
		server_id: 1,
		cid: 'MNK81964',
		firstname: 'David',
		lastname: 'Achter',
		phone: '0487809321',
		permissionGroup: 'god',
		job: 'judge',
		hasVPN: true,
	},
};
emulatedEvents.setOpenState = {
	app: 'home-screen',
	action: 'setOpenState',
	data: true,
};

export const devDataPlugin = (store: Store<State>) => {
	// Do not run if env is production
	if (process.env.NODE_ENV !== 'development') return;
	store.commit('setAppState', {
		appName: 'mail',
		data: devdata.mail,
	});
	// setTimeout(() => {
	// 	store.dispatch('addNotification', {
	// 		id: 'devdata-noti-1',
	// 		title: 'From the PM',
	// 		description: 'A new race is about to start',
	// 		icon: 'info',
	// 		sticky: true,
	// 		onAccept: (data: any) => console.log('Noti accepted', data),
	// 		onDecline: (data: any) => console.log('Noti declined', data),
	// 		_data: {
	// 			isDev: true,
	// 		},
	// 	});
	// }, 1000);
	// setTimeout(() => {
	// 	store.dispatch('addNotification', {
	// 		id: 'devdata-noti-2',
	// 		title: 'Tweet',
	// 		description: 'Dickhead tweeted: I love grinding all night and all day you know its super fun',
	// 		icon: 'info',
	// 	});
	// }, 2000);
};
