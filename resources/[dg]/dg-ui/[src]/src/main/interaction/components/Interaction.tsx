import React from 'react';
import { animated, Transition } from 'react-spring';
import { Typography } from '@mui/material';

import { useVhToPixel } from '../../../lib/hooks/useVhToPixel';

export const Interaction = props => {
  const hiddenMargin = useVhToPixel(-20);
  const showMargin = useVhToPixel(1);
  return (
    <div className={'interaction__wrapper'}>
      <Transition
        items={props.show}
        reverse={props.show}
        config={{
          duration: 350,
        }}
        from={{ marginLeft: hiddenMargin }}
        enter={{ marginLeft: showMargin }}
        leave={{ marginLeft: hiddenMargin }}
      >
        {(styles, item) =>
          item && (
            <animated.div style={styles} className={`interaction ${props.type}`}>
              <Typography variant='button' dangerouslySetInnerHTML={{ __html: props.text }} />
            </animated.div>
          )
        }
      </Transition>
    </div>
  );
};
