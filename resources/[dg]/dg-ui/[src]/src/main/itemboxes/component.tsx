import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { ItemboxList } from './components/itemboxlist';
import store from './store';

import './styles/itemboxes.scss';

const Component: AppFunction<Itemboxes.State> = props => {
  const handleVisibility = (visible: boolean) => {
    props.updateState(() => ({ visible }));
  };

  const eventHandler = useCallback((data: any) => {
    const itembox: Itemboxes.Itembox = {
      action: data.action ?? '',
      image: data.image ?? 'noicon.png',
    };
    props.updateState(rootState => ({ itemboxes: [itembox, ...rootState.itemboxes.itemboxes] }));
    // We can just remove last item because new ones get added to front of array and removal time is always same so last one is always oldest
    setTimeout(() => {
      props.updateState(rootState => {
        const lastItemIndex = rootState.itemboxes.itemboxes.length - 1;
        return {
          itemboxes: rootState.itemboxes.itemboxes.filter((_, i) => i !== lastItemIndex),
        };
      });
    }, 3000);
  }, []);

  const handleShow = useCallback(() => handleVisibility(true), []);
  const handleHide = useCallback(() => handleVisibility(false), []);
  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} center unSelectable>
      <ItemboxList {...props} />
    </AppWrapper>
  );
};

export default Component;
