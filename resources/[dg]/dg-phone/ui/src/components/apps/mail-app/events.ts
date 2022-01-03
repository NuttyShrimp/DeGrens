import { store } from '../../../lib/state';
import { Mail } from '../../../types/apps';

export const events: any = {};

events.newMail = (mail: Partial<Mail>) => {
	store.dispatch('addMail', mail);
};
