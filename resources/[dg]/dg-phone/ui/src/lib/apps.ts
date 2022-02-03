import { store } from './state';
import { PhoneNotificationIcon } from '../types/notifications';

export let appsLoaded = false;

export interface ConfigObject {
	name: string;
	label: string;
	background?: string | Partial<CSSStyleDeclaration>;
	icon?: PhoneNotificationIcon;
	position: number;
	render: any;
	hidden?: () => boolean;
	events?: Record<string, (data: any) => void>;
	init?: () => void; // Function called right after phone is started
}

export const defaultConfigObject = {
	background: '#1B1E23',
	position: 75,
	hidden: () => false,
};

export const phoneApps: Record<string, ConfigObject> = {};

export const getPhoneAppRenders = () => {
	const renders: Record<string, any> = {};
	for (const name in getPhoneApps()) {
		renders[name] = phoneApps[name].render;
	}
	return renders;
};

export const getPhoneApps = (): Record<string, ConfigObject> => {
	const importAll = (modules: Record<string, { [key: string]: any }>) => {
		Object.values(modules).forEach(value => {
			const config = value.default();
			if (config.events) {
				store.commit('setEventsForApp', { name: config.name, evts: config.events });
			}
			phoneApps[config.name] = config;
		});
	};
	importAll(import.meta.globEager('../components/apps/**/_config.ts'));
	appsLoaded = true;
	return phoneApps;
};

export const initPhoneApps = async () => {
	while (!appsLoaded) {
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	for (const name in phoneApps) {
		if (phoneApps?.[name]?.init) {
			phoneApps[name]?.init?.();
		}
	}
};
