import React from 'react';
import AppWrapper from '@components/appwrapper';

import { sanitizeText } from '../../lib/util';

import { Interaction } from './components/Interaction';
import store from './store';

import './styles/interaction.scss';

const Component: AppFunction<Interaction.State> = props => {
  const showInteraction = (data: { text: string; type: InteractionType }) => {
    props.updateState({
      visible: true,
      show: true,
      text: sanitizeText(
        (data.text ?? '').toUpperCase().replace(/\[.\]/, match => `<span class='shadow'>${match}</span>`)
      ),
      type: data.type,
    });
  };

  const hideInteraction = () => {
    props.updateState({
      show: false,
    });
    // Animate out
    setTimeout(() => {
      props.updateState({
        visible: false,
        text: '',
        type: 'info',
      });
    }, 500);
  };

  return (
    <AppWrapper appName={store.key} onShow={showInteraction} onHide={hideInteraction} full unSelectable>
      <Interaction {...props} />
    </AppWrapper>
  );
};

export default Component;
