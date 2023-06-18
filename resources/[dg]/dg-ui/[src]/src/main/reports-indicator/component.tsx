import { useCallback } from 'react';
import { animated, useSpring } from 'react-spring';
import { Chip } from '@mui/material';
import { baseStyle } from '@src/base.styles';
import AppWrapper from '@src/components/appwrapper';
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
  const showVh = useVhToPixel(0);
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
            width: '7vh',
            height: 'max-content',
            backgroundColor: baseStyle.primary.dark,
            padding: '1.5vh',
            borderRadius: '0.7rem 0 0 0.7rem',
            ...springStyle,
          }}
        >
          <p
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
            }}
          >
            New Report Updates
            <Chip size='small' label={counter} color='error' sx={{ marginTop: '.5rem' }} />
          </p>
        </animated.div>
      )}
    </AppWrapper>
  );
};

export default Container;
