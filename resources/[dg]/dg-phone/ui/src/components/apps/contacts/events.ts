import { store } from '../../../lib/state';
import { Contact } from '../../../types/apps';
import { AddContactForm } from './components/ContactForm.vue';

export const events: any = {};

events.openNewContactModal = (data: Partial<Contact>) => {
	store.dispatch('openModal', {
		element: AddContactForm,
		props: { ...data },
	});
};
