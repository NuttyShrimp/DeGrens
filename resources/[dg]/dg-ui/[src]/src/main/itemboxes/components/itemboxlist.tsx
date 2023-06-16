import { FC } from 'react';
import { animated, easings, Transition } from 'react-spring';
import { useVhToPixel } from '@lib/hooks/useVhToPixel';

import { useItemBoxStore } from '../stores/useItemboxStore';

import { Itembox } from './itembox';

export const ItemboxList: FC<{}> = () => {
  const itemBoxes = useItemBoxStore(s => s.itemboxes);
  const hiddenMargin = useVhToPixel(40);

  return (
    <div className={'itemboxes__list'}>
      <Transition
        items={itemBoxes}
        config={{
          duration: 500,
          easing: easings.easeInOutQuart,
        }}
        from={{ marginTop: hiddenMargin }}
        enter={{ marginTop: 0 }}
        leave={{ marginTop: hiddenMargin }}
      >
        {(style, itembox) => {
          return (
            <animated.div style={style}>
              <Itembox {...itembox} />
            </animated.div>
          );
        }}
      </Transition>
    </div>
  );
};
