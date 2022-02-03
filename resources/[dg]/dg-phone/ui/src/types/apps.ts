// info
export interface infoAppEntry {
	name: string;
	value: string | number;
	icon: string;
	color?: string;
	prefix?: string;
}

// contacts
export interface Contact {
	id: number;
	label: string;
	phone: string;
}

// dialer
export interface CallHistoryEntry {
	name?: string;
	number?: string;
	// UNIX timestamp
	date: number;
	incoming: boolean;
}

export interface TabEntry {
	name: string;
	icon: string;
	label: string;
}

// twitter
export interface Tweet {
	id: number;
	tweet: string;
	date: number;
	sender_name: string;
	like_count: number;
	retweet_count: number;
	liked: boolean;
	retweeted: boolean;
}

// messages
export interface Message {
	id: number;
	isreceiver: boolean;
	message: string;
	isread: boolean;
	date: number;
}

export type MessageObject = Record<string, Message[]>;

// Yellow pages
export interface YellowPageEntry {
	id: number;
	text: string;
	name: string;
	phone: string;
}

// Mails
export interface Mail {
	id: number;
	sender: string;
	subject: string;
	message: string;
	date: number;
}

// Notes
export interface Note {
	id: number;
	title: string;
	note: string;
	date: number;
	readonly?: boolean;
}

// Gallery
export interface GalleryEntry {
	id: number;
	link: string;
	big?: boolean;
}

// The state
export interface JusticePerson {
	name: string;
	phone: string;
	available: boolean;
}

// Crypto
export interface CoinEntry {
	icon: string;
	crypto_name: string;
	value: number;
	wallet: {
		cname: string;
		amount: number;
		cid: string;
	};
}
