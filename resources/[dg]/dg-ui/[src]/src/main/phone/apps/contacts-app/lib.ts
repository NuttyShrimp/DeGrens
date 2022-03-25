import { devData } from '@lib/devdata';
import { nuiAction } from '@lib/nui-comms';
import { store } from '@lib/redux';

import { genericAction } from '../../lib';

const getState = () => store.getState()['phone.apps.contacts'];

export const getContact = (phone: string): Phone.Contacts.Contact | undefined => {
  const appState = getState();
  return appState.contacts.find(contact => contact.phone === phone);
};

export const fetchContacts = async () => {
  const appState = getState();
  appState.contacts = await nuiAction<Phone.Contacts.Contact[]>('phone/contacts/getContacts', {}, devData.contacts);
  genericAction('phone.apps.contacts', appState);
  return appState.contacts;
};
