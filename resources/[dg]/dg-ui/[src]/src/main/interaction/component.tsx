import React, { useCallback, useEffect, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { sanitizeText } from '../../lib/util';

import { Interaction } from './components/Interaction';
import store from './store';

import './styles/interaction.scss';

const Component: AppFunction<Interaction.State> = props => {
  const [stopHiding, setStopHiding] = useState(false);
  const [hidingTimeout, setHidingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!stopHiding) return;
    if (hidingTimeout !== null) {
      clearTimeout(hidingTimeout);
      setHidingTimeout(null);
    }
    setStopHiding(false);
  }, [stopHiding]);

  const showInteraction = useCallback((data: { text: string; type: InteractionType }) => {
    setStopHiding(true);
    props.updateState({
      visible: true,
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
    // Animate out
    const timeout = setTimeout(() => {
      props.updateState({
        visible: false,
        text: '',
        type: 'info',
      });
    }, 500);
    // Save timeout to be able to cancel when we show again
    setHidingTimeout(timeout);
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={showInteraction} onHide={hideInteraction} full unSelectable>
      <Interaction {...props} />
    </AppWrapper>
  );
};

export default Component;
