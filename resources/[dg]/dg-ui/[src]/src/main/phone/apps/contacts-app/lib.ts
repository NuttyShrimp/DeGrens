import { devData } from '@lib/devdata';
import { nuiAction } from '@lib/nui-comms';

import { useContactAppStore } from './stores/useContactAppStore';

export const getContact = (phone: string): Phone.Contacts.Contact | undefined => {
  return useContactAppStore.getState().contacts.find(contact => contact.phone === phone);
};

export const fetchContacts = async () => {
  const contacts = await nuiAction<Phone.Contacts.Contact[]>('phone/contacts/getContacts', {}, devData.contacts);
  useContactAppStore.setState({ contacts });
  return contacts;
};
