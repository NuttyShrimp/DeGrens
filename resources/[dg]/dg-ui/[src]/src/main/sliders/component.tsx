import { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';
import { nuiAction } from '@src/lib/nui-comms';

import { Sliders } from './components/sliders';
import config from './_config';

import './styles/sliders.scss';

const Component: AppFunction = props => {
  const [settings, setSettings] = useState<Sliders.Settings>({
    power: [0, 100],
    amount: [0, 100],
  });

  const onShow = useCallback((data: Sliders.Settings) => {
    props.showApp();
    setSettings({
      power: [...data.power],
      amount: [...data.amount],
    });
  }, []);

  const onHide = useCallback(() => {
    props.hideApp();
    nuiAction('sliders/close', { settings });
  }, [settings]);

  return (
    <AppWrapper appName={config.name} onShow={onShow} onHide={onHide} hideOnEscape full center>
      <Sliders settings={settings} setSettings={setSettings} />
    </AppWrapper>
  );
};

export default Component;
