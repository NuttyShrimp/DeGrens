import { showFormModal } from '../../lib';

import { ContactModal } from './components/modals';

export const events: Phone.Events = {};

events.openNewContactModal = (data: Partial<Phone.Contacts.Contact>) => {
  showFormModal(<ContactModal contact={data} type={'new'} />);
};
