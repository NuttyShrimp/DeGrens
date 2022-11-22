import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { sanitizeText } from '../../lib/util';

import { Interaction } from './components/Interaction';
import store from './store';

import './styles/interaction.scss';

const Component: AppFunction<Interaction.State> = props => {
  const showInteraction = useCallback((data: { text: string; type: InteractionType }) => {
    props.updateState({
      show: true,
      text: sanitizeText(
        (data.text ?? '').toUpperCase().replace(/\[.\]/, match => `<span class='shadow'>${match}</span>`)
      ),
      type: data.type,
    });
  }, []);

  const hideInteraction = useCallback(() => {
    props.updateState({
      show: false,
    });
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={showInteraction} onHide={hideInteraction} full unSelectable>
      <Interaction {...props} />
    </AppWrapper>
  );
};

export default Component;
