import React, { FC } from 'react';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import NumberFormat from '@src/components/numberformat';

import '../styles/bars.scss';

export const Bars: FC<Bennys.TitleBars> = props => {
  return (
    <div className='bennys-bar-wrapper'>
      <Box className='bennys-bar-bar header' px={'2vh'}>
        <Typography variant='h4' fontWeight={700} style={{ textAlign: 'left' }}>
          {props.title.toUpperCase()}
        </Typography>
        <Typography variant='h5' fontWeight={700} style={{ textAlign: 'center' }}>
          {(props.isInCart && 'IN CART') || (props.equipped && 'EQUIPPED')}
        </Typography>
        <Typography variant='h5' fontWeight={600} style={{ textAlign: 'right' }}>
          <NumberFormat.Bank decimalScale={0} prefix={'€'} value={props.price} />
        </Typography>
      </Box>
      <div className='bennys-bar-bar bennys-bar-guides'>
        {props.guides.map(guide => (
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
