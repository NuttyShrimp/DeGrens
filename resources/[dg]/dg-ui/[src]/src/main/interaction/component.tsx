import { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { sanitizeText } from '../../lib/util';

import { Interaction } from './components/Interaction';
import { useInteractionStore } from './stores/useInteractionStore';
import config from './_config';

import './styles/interaction.scss';

const Component: AppFunction = () => {
  const updateStore = useInteractionStore(s => s.updateStore);
  const showInteraction = useCallback((data: { text: string; type: InteractionType }) => {
    updateStore({
      show: true,
      text: sanitizeText(
        (data.text ?? '').toUpperCase().replace(/\[.\]/, match => `<span class='shadow'>${match}</span>`)
      ),
      type: data.type,
    });
  }, []);

  const hideInteraction = useCallback(() => {
    updateStore({
      show: false,
    });
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={showInteraction} onHide={hideInteraction} full unSelectable>
      <Interaction />
    </AppWrapper>
  );
};

export default Component;
