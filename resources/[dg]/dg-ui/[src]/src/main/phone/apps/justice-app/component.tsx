import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Justice } from './components/justice';
const whitelistedJobs = ['judge', 'lawyer'];

const Component: AppFunction<Phone.Justice.State> = props => {
  const [available, setAvailable] = useState(false);
  const character = useSelector<RootState, Character>(state => state.character);
  const fetchList = async () => {
    const list = await nuiAction('phone/justice/get', {}, devData.justice);
    props.updateState({
      list,
    });
    getAvailability();
  };

  const getAvailability = () => {
    let isAvail = false;
    if (Object.keys(props.list).includes(character.job)) {
      isAvail = props.list[character.job].find(p => p.phone === character.phone)?.available ?? false;
    }
    setAvailable(isAvail);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <AppContainer
      primaryActions={
        whitelistedJobs.includes(character.job)
          ? available === true
            ? [
                {
                  title: 'Zet onbeschikbaar',
                  icon: 'handshake-slash',
                  onClick: async () => {
                    await nuiAction('phone/justice/setAvailable', {
                      available: false,
                    });
                    await fetchList();
                  },
                },
              ]
            : [
                {
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
      <Justice {...props} character={character} />
    </AppContainer>
  );
};

export default Component;
