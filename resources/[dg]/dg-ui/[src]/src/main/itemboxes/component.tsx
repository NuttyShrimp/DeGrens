import { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { ItemboxList } from './components/itemboxlist';
import { useItemBoxStore } from './stores/useItemboxStore';
import config from './_config';

import './styles/itemboxes.scss';

const Component: AppFunction = props => {
  const updateStore = useItemBoxStore(s => s.updateStore);
  const eventHandler = useCallback((data: any) => {
    const itembox: Itemboxes.Itembox = {
      action: data.action ?? '',
      image: data.image ?? 'noicon.png',
    };
    updateStore(rootState => ({ itemboxes: [itembox, ...rootState.itemboxes] }));
    // We can just remove last item because new ones get added to front of array and removal time is always same so last one is always oldest
    setTimeout(() => {
      updateStore(rootState => {
        const lastItemIndex = rootState.itemboxes.length - 1;
        return {
          itemboxes: rootState.itemboxes.filter((_, i) => i !== lastItemIndex),
        };
      });
    }, 3000);
  }, []);

  const handleShow = useCallback(() => props.showApp, [props.showApp]);
  const handleHide = useCallback(() => props.hideApp, [props.hideApp]);
  return (
    <AppWrapper
      appName={config.name}
      onShow={handleShow}
      onHide={handleHide}
      onEvent={eventHandler}
      center
      unSelectable
    >
      <ItemboxList />
    </AppWrapper>
  );
};

export default Component;
