import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { ItemboxList } from './components/itemboxlist';
import store from './store';

import './styles/itemboxes.scss';

const Component: AppFunction<Itemboxes.State> = props => {
  const handleVisibility = (visible: boolean) => {
    props.updateState({ visible });
  };

  const eventHandler = useCallback(
    (data: any) => {
      const itembox: Itemboxes.Itembox = {
        action: data.action ?? '',
        image: data.image ?? 'noicon.png',
      };
      props.updateState({ itemboxes: [itembox, ...props.itemboxes] });
      setTimeout(() => {
        props.updateState({ itemboxes: props.itemboxes.filter((_, i) => i !== props.itemboxes.length - 1) });
      }, 3000);
    },
    [props.itemboxes]
  );

  const handleShow = useCallback(() => handleVisibility(true), []);
  const handleHide = useCallback(() => handleVisibility(false), []);
  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} center unSelectable>
      <ItemboxList {...props} />
    </AppWrapper>
  );
};

export default Component;
