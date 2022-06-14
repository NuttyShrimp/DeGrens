import React, { useEffect, useState } from 'react';

import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Contacts } from './components/contacts';
import { ContactModal } from './components/modals';
import { fetchContacts } from './lib';

const Component: AppFunction<Phone.Contacts.State> = props => {
  const [contacts, setContacts] = useState(props.contacts);
  useEffect(() => {
    fetchContacts();
  }, []);
  useEffect(() => {
    setContacts(props.contacts);
  }, [props.contacts]);

  return (
    <AppContainer
      primaryActions={[
        {
          title: 'Nieuw',
          icon: 'plus',
          onClick: () => {
            showFormModal(<ContactModal contact={{}} type={'new'} />);
          },
        },
      ]}
      search={{
        list: props.contacts,
        filter: ['label', 'phone'],
        onChange: value => {
          setContacts(value);
        },
      }}
      emptyList={props.contacts.length === 0}
    >
      <Contacts contacts={contacts} />
    </AppContainer>
  );
};

export default Component;
