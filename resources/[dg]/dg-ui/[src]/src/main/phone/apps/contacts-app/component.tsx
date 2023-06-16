import { FC, useEffect, useState } from 'react';

import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Contacts } from './components/contacts';
import { ContactModal } from './components/modals';
import { useContactAppStore } from './stores/useContactAppStore';
import { fetchContacts } from './lib';

const Component: FC<{}> = () => {
  const storeContacts = useContactAppStore(s => s.contacts);
  const [contacts, setContacts] = useState(storeContacts);
  useEffect(() => {
    fetchContacts();
  }, []);
  useEffect(() => {
    setContacts(storeContacts);
  }, [storeContacts]);

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
        list: storeContacts,
        filter: ['label', 'phone'],
        onChange: value => {
          setContacts(value);
        },
      }}
      emptyList={storeContacts.length === 0}
    >
      <Contacts contacts={contacts} />
    </AppContainer>
  );
};

export default Component;
