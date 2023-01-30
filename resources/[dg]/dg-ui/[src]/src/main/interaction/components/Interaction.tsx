import React from 'react';
import { animated, Transition } from 'react-spring';
import { Typography } from '@mui/material';

import { useVhToPixel } from '../../../lib/hooks/useVhToPixel';
import { useInteractionStore } from '../stores/useInteractionStore';

export const Interaction = () => {
  const [show, text, type] = useInteractionStore(s => [s.show, s.text, s.type]);
  const hiddenMargin = useVhToPixel(-20);
  const showMargin = useVhToPixel(1);
  return (
    <div className={'interaction__wrapper'}>
      <Transition
        items={show}
        reverse={show}
        config={{
          duration: 350,
        }}
        from={{ marginLeft: hiddenMargin }}
        enter={{ marginLeft: showMargin }}
        leave={{ marginLeft: hiddenMargin }}
      >
        {(styles, item) =>
          item && (
            <animated.div style={styles} className='interaction__outer'>
              <div className={`interaction ${type}`}>
                <Typography variant='button' dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            </animated.div>
          )
        }
      </Transition>
    </div>
  );
};
