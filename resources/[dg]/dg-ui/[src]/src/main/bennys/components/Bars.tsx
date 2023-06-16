import { FC } from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import NumberFormat from '@src/components/numberformat';

import { useBennyStore } from '../stores/useBennyStore';

import '../styles/bars.scss';

export const Bars: FC = () => {
  const bars = useBennyStore(s => s.bars);
  return (
    <div className='bennys-bar-wrapper'>
      <Box className='bennys-bar-bar header' px={'2vh'}>
        <Typography variant='h4' fontWeight={700} style={{ textAlign: 'left' }}>
          {bars.title.toUpperCase()}
        </Typography>
        <Typography variant='h5' fontWeight={700} style={{ textAlign: 'center' }}>
          {(bars.isInCart && 'IN CART') || (bars.equipped && 'EQUIPPED')}
        </Typography>
        <Typography variant='h5' fontWeight={600} style={{ textAlign: 'right' }}>
          <NumberFormat.Bank decimalScale={0} prefix={'€'} value={bars.price} />
        </Typography>
      </Box>
      <div className='bennys-bar-bar bennys-bar-guides'>
        {bars.guides.map(guide => (
          <div key={`bennys-guide-${guide.title}-${guide.kbdCombo.length}`} className='bennys-bar-guide'>
            {guide.kbdCombo.map((key, idx) => (
              <kbd key={`${guide.title}-key-${key}`}>
                {key}
                {idx < guide.kbdCombo.length - 1 && ' + '}
              </kbd>
            ))}
            <Typography variant='overline' fontSize={'1rem'}>
              {guide.title.toUpperCase()}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  );
};
