import React, { useEffect, useState } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { NewAd } from './components/modals';
import { YellowPages } from './components/yellowpages';

const Component: AppFunction<Phone.YellowPages.State> = props => {
  const [list, setList] = useState(props.list);

  const fetchListings = async () => {
    const listings = await nuiAction('phone/yellowpages/getList', {}, devData.YPListings);
    props.updateState({
      list: listings,
    });
    setList(listings);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <AppContainer
      primaryActions={[
        {
          title: 'Nieuw',
          icon: 'ad',
          onClick: () => {
            showFormModal(<NewAd ad={props.current} onAccept={fetchListings} />);
          },
        },
      ]}
      search={{
        list: props.list,
        filter: ['phone', 'text', 'name'],
        onChange: value => {
          setList(value);
        },
      }}
      emptyList={props.list.length === 0}
    >
      <YellowPages {...props} list={list} />
    </AppContainer>
  );
};

export default Component;
