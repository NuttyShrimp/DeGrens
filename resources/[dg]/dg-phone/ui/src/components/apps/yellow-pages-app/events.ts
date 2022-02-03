import { store } from '../../../lib/state';
import { YellowPageEntry } from '../../../types/apps';

export const events: any = {};

events.setCurrentAd = (ad: YellowPageEntry) => {
	ad = ad ?? null;
	store.commit('setActiveYP', ad);
};
