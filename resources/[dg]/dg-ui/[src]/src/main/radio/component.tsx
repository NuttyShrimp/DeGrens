import React, { useCallback, useState } from 'react';
import { animated, easings, useSpring } from 'react-spring';
import AppWrapper from '@components/appwrapper';

import { useVhToPixel } from '../../lib/hooks/useVhToPixel';

import { Radio } from './component/Radio';
import store from './store';

import './styles/radio.scss';

const Component: AppFunction<Radio.State> = props => {
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
      props.updateState({
        visible: false,
      });
    }, [show]),
  });

  const showRadio = (data: Radio.Info) => {
    props.updateState({
      visible: true,
      ...data,
    });
    setShow(true);
  };

  const hideRadio = () => {
    setShow(false);
  };

  return (
    <AppWrapper appName={store.key} onShow={showRadio} onHide={hideRadio} full center hideOnEscape>
      <animated.div style={slideStyle} className={'radio-wrapper'}>
        <Radio frequency={props.frequency} enabled={props.enabled} updateState={props.updateState} />
      </animated.div>
    </AppWrapper>
  );
};

export default Component;
