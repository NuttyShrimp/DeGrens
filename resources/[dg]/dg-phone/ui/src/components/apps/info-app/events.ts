import { store } from '../../../lib/state';
import { infoAppEntry } from '../../../types/apps';

export const events: any = {};

events.registerInfoEntry = (entry: infoAppEntry) => {
	store.commit('setAppState', { appName: 'info', data: [...store.state.info, entry] });
};
