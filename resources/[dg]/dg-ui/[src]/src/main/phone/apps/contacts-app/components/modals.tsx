import React, { FC } from 'react';

import { Input } from '../../../../../components/inputs';
import { SimpleForm } from '../../../../../components/simpleform';
import { nuiAction } from '../../../../../lib/nui-comms';
import { showCheckmarkModal, showLoadModal } from '../../../lib';
import { fetchContacts } from '../lib';

enum ModalHeader {
  'new' = 'Nieuw contact',
  'edit' = 'Contact bewerken',
}

enum ModalAction {
  'new' = 'add',
  'edit' = 'update',
}

export const ContactModal: FC<
  React.PropsWithChildren<{ contact: Partial<Phone.Contacts.Contact>; type: 'edit' | 'new' }>
> = props => (
  <SimpleForm
    header={ModalHeader[props.type]}
    elements={[
      {
        name: 'label',
        defaultValue: props.contact.label,
        render: props => <Input.TextField {...props} label={'Label'} icon={'tag'} />,
      },
      {
        name: 'phone',
        defaultValue: props.contact.phone,
        render: props => <Input.TextField {...props} label={'TelefoonNr'} icon={'mobile'} />,
      },
    ]}
    onAccept={async contact => {
      showLoadModal();
      await nuiAction(`phone/contacts/${ModalAction[props.type]}`, contact);
      showCheckmarkModal(() => fetchContacts());
    }}
  />
);
