import { useCallback, useState } from 'react';
import { animated, easings, useSpring } from 'react-spring';
import AppWrapper from '@components/appwrapper';

import { useVhToPixel } from '../../lib/hooks/useVhToPixel';

import { Radio } from './component/Radio';
import { useRadioStore } from './stores/useRadioStore';
import config from './_config';

import './styles/radio.scss';

const Component: AppFunction = props => {
  const updateStore = useRadioStore(s => s.updateStore);
  const [show, setShow] = useState(false);
  const closedVh = useVhToPixel(-51);
  const openVh = useVhToPixel(-1);
  const slideStyle = useSpring({
    bottom: show ? openVh : closedVh,
    config: {
      duration: 500,
      easing: easings.easeInOutQuart,
    },
    onRest: useCallback(() => {
      if (show) return;
      props.hideApp();
    }, [show, props.hideApp]),
  });

  const showRadio = useCallback((data: Radio.Info) => {
    props.showApp();
    updateStore(data);
    setShow(true);
  }, []);

  const hideRadio = useCallback(() => {
    setShow(false);
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={showRadio} onHide={hideRadio} full center hideOnEscape>
      <animated.div style={slideStyle} className={'radio-wrapper'}>
        <Radio />
      </animated.div>
    </AppWrapper>
  );
};

export default Component;
