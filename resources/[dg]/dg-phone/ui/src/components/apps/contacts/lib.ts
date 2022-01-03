import { Contact } from '../../../types/apps';
import { store } from '../../../lib/state';
import { nuiAction } from '../../../lib/nui';
import { devdata } from '../../../lib/devdata';

export const getContact = (phone: string): Contact | undefined => {
	const contacts = store.getters.getAppState('contacts') as Contact[];
	return contacts.find(contact => contact.phone === phone);
};

export const fetchContacts = async () => {
	const newContacts = await nuiAction('contacts:getContacts', {}, devdata.contacts);
	store.commit('setAppState', { appName: 'contacts', data: newContacts });
	return newContacts;
};
