import React, { useCallback } from 'react';
import { animated, useSpring } from 'react-spring';
import { Badge } from '@mui/material';
import AppWrapper from '@src/components/appwrapper';
import { Icon } from '@src/components/icon';
import { useVhToPixel } from '@src/lib/hooks/useVhToPixel';

import { useReportStore } from '../reports/stores/reportStore';

import { useReportIndicatorStore } from './stores/useReportIndicatorStore';
import config from './_config';

const Container: AppFunction = props => {
  const [counter, incCounter] = useReportIndicatorStore(s => [s.counter, s.incCounter]);
  const [addUnread, selectedReport] = useReportStore(s => [s.addUnread, s.selectedReport]);

  const handleShow = useCallback(() => props.showApp(), [props.showApp]);
  const handleHide = useCallback(() => {
    props.hideApp();
  }, [props.hideApp]);
  const showVh = useVhToPixel(3);
  const hiddenVh = useVhToPixel(-5);

  const springStyle = useSpring({
    from: {
      right: hiddenVh,
    },
    to: {
      right: showVh,
    },
  });

  const eventHandler = (evt: any) => {
    switch (evt.action) {
      case 'announce': {
        if (selectedReport === evt.data.id) return;
        incCounter();
        addUnread(evt.data);
      }
    }
  };

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} onEvent={eventHandler} full>
      {counter > 0 && (
        <animated.div
          style={{
            position: 'absolute',
            top: '30vh',
            height: 'fit-content',
            ...springStyle,
          }}
        >
          <Badge badgeContent={counter} color='error'>
            <Icon name='message-exclamation'></Icon>
          </Badge>
        </animated.div>
      )}
    </AppWrapper>
  );
};

export default Container;
