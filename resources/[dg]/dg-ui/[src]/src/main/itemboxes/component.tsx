import React, { useEffect, useRef } from 'react';
import AppWrapper from '@components/appwrapper';

import { ItemboxList } from './components/itemboxlist';
import store from './store';

import './styles/itemboxes.scss';

const Component: AppFunction<Itemboxes.State> = props => {
  const itemboxesRef = useRef(props.itemboxes);

  useEffect(() => {
    itemboxesRef.current = props.itemboxes;
  }, [props.itemboxes]);

  const handleVisibility = (visible: boolean) => {
    props.updateState({ visible });
  };

  const eventHandler = (data: any) => {
    const itembox: Itemboxes.Itembox = {
      action: data.action ?? '',
      image: data.image ?? 'noicon.png',
    };
    props.updateState({ itemboxes: [itembox, ...itemboxesRef.current] });
    setTimeout(() => {
      props.updateState({ itemboxes: itemboxesRef.current.filter((_, i) => i !== itemboxesRef.current.length - 1) });
    }, 3000);
  };

  return (
    <AppWrapper
      appName={store.key}
      onShow={() => handleVisibility(true)}
      onHide={() => handleVisibility(false)}
      onEvent={d => eventHandler(d)}
      center
      unSelectable
    >
      <ItemboxList {...props} />
    </AppWrapper>
  );
};

export default Component;
