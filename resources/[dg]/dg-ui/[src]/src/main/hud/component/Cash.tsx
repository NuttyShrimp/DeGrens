import { FC } from 'react';
import { animated, useSpring } from 'react-spring';
import { NumberFormat } from '@src/components/numberformat';

import { useHudStore } from '../stores/useHudStore';

export const CashEntry: FC<{ amount: number; noPrefix?: boolean }> = ({ amount, noPrefix }) => {
  const animStyles = useSpring({
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
    config: {
      duration: 150,
    },
  });
  return (
    <animated.div style={animStyles}>
      <span style={{ color: amount >= 0 ? '#00ac31' : '#ac0000' }}>€ </span>
      <NumberFormat.Bank value={amount} prefix={noPrefix ? '' : amount >= 0 ? '+' : ''} />
    </animated.div>
  );
};

export const Cash: FC<{}> = () => {
  const { current, history } = useHudStore(s => s.cash);
  return (
    <div className='hud-cash'>
      <CashEntry amount={current} noPrefix />
      <div>
        {history.map(h => (
          <CashEntry key={h} amount={h} />
        ))}
      </div>
    </div>
  );
};
