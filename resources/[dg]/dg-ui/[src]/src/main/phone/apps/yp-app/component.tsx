import { useEffect, useState } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { NewAd } from './components/modals';
import { YellowPages } from './components/yellowpages';
import { useYPAppStore } from './stores/useYPAppStore';

const Component = () => {
  const [storeList, currentAd, setStoreList] = useYPAppStore(s => [s.list, s.current, s.setList]);
  const [list, setList] = useState(storeList);

  const fetchListings = async () => {
    const listings = await nuiAction('phone/yellowpages/getList', {}, devData.YPListings);
    setStoreList(listings);
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
            showFormModal(<NewAd ad={currentAd} onAccept={fetchListings} />);
          },
        },
      ]}
      search={{
        list: storeList,
        filter: ['phone', 'text', 'name'],
        onChange: value => {
          setList(value);
        },
      }}
      emptyList={storeList.length === 0}
    >
      <YellowPages list={list} />
    </AppContainer>
  );
};

export default Component;
