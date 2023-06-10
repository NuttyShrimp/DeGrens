import React, { useEffect, useState } from 'react';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Justice } from './components/justice';
import { FineModal } from './components/modals';
import { useJusticeAppStore } from './stores/useJusticeAppStore';
const whitelistedJobs = ['judge', 'lawyer'];

const Component = () => {
  const [available, setAvailable] = useState(false);
  const [phone, job] = useMainStore(s => [s.character.phone, s.character.job]);
  const [list, setList] = useJusticeAppStore(s => [s.list, s.setList]);
  const fetchList = async () => {
    const list = await nuiAction('phone/justice/get', {}, devData.justice);
    setList(list);
    getAvailability();
  };

  const getAvailability = () => {
    let isAvail = false;
    if (Object.keys(list).includes(job)) {
      isAvail = list[job].find(p => p.phone === phone)?.available ?? false;
    }
    setAvailable(isAvail);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <AppContainer
      primaryActions={
        whitelistedJobs.includes(job)
          ? [
              {
                title: 'Factureer',
                icon: 'file-invoice-dollar',
                onClick: () => {
                  showFormModal(<FineModal />);
                },
              },
              available === true
                ? {
                    title: 'Zet onbeschikbaar',
                    icon: 'handshake-slash',
                    onClick: async () => {
                      await nuiAction('phone/justice/setAvailable', {
                        available: false,
                      });
                      await fetchList();
                    },
                  }
                : {
                    title: 'Zet beschikbaar',
                    icon: 'handshake',
                    onClick: async () => {
                      await nuiAction('phone/justice/setAvailable', {
                        available: true,
                      });
                      await fetchList();
                    },
                  },
            ]
          : []
      }
    >
      <Justice />
    </AppContainer>
  );
};

export default Component;
