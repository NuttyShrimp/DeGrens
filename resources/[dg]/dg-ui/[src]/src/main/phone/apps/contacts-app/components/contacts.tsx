import React, { FC } from 'react';

import { Paper } from '../../../../../components/paper';
import { ConfirmationModal } from '../../../../../components/util';
import { nuiAction } from '../../../../../lib/nui-comms';
import { copyToClipboard } from '../../../../../lib/util';
import { showCheckmarkModal, showFormModal, showLoadModal } from '../../../lib';
import { openConversation } from '../../message-app/lib';
import { startPhoneCall } from '../../phone-app/lib';
import { fetchContacts } from '../lib';

import { styles } from './contacts.styles';
import { ContactModal } from './modals';

export const Contacts: FC<React.PropsWithChildren<{ contacts: Phone.Contacts.Contact[] }>> = props => {
  const classes = styles();

  const actions: Action[] = [
    {
      title: 'Bewerk',
      icon: 'pencil',
      onClick: (c: Phone.Contacts.Contact) => {
        showFormModal(<ContactModal contact={c} type={'edit'} />);
      },
    },
    {
      title: 'Verwijder',
      icon: 'trash-alt',
      onClick: (c: Phone.Contacts.Contact) => {
        showFormModal(
          <ConfirmationModal
            header={'Weet je zeker dat je dit contact wilt verwijderen?'}
            onAccept={async () => {
              showLoadModal();
              await nuiAction('phone/contacts/delete', {
                id: c.id,
              });
              showCheckmarkModal(() => fetchContacts());
            }}
          />
        );
      },
    },
    {
      title: 'Bel',
      icon: 'phone',
      onClick: (c: Phone.Contacts.Contact) => {
        startPhoneCall(c.phone);
      },
    },
    {
      title: 'SMS',
      icon: 'comment-alt',
      onClick: (c: Phone.Contacts.Contact) => {
        openConversation(c.phone);
      },
    },
    {
      title: 'Kopieer',
      icon: 'clipboard',
      onClick: (c: Phone.Contacts.Contact) => {
        copyToClipboard(c.phone);
      },
    },
  ];

  return (
    <div className={classes.root}>
      {props.contacts.map(c => (
        <Paper
          key={c.id}
          title={c.label}
          description={c.phone}
          image={'user-circle'}
          actions={actions.map(a => ({ ...a, data: c }))}
        />
      ))}
    </div>
  );
};
