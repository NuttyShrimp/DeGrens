import React, { FC, useState } from 'react';
import { Input } from '@components/inputs';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import { startPhoneCall } from '../lib';

import { styles } from './phone.styles';

const DialerBtn = styled(Button)({
  borderRadius: '50%',
  minWidth: '3vh',
  width: '3vh',
  minHeight: '3vh',
  height: '3vh',
});

const btns = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]];

export const Dialer: FC<React.PropsWithChildren<unknown>> = () => {
  const classes = styles();
  const [value, setValue] = useState('');

  const handleStartCall = () => {
    startPhoneCall(value);
    setValue('');
  };

  return (
    <div className={classes.dialerRoot}>
      <Input.Number onChange={setValue} value={value} label={'TelefoonNr'} handleEnter={handleStartCall} />
      <div className={classes.dialerBtns}>
        {btns.map((row, i) => (
          <div key={i} className={classes.dialerRow}>
            {row.map((btn, j) => (
              <DialerBtn key={j} onClick={() => setValue(value + btn)} variant={'outlined'}>
                {btn}
              </DialerBtn>
            ))}
          </div>
        ))}
      </div>
      <DialerBtn
        variant={'contained'}
        sx={{
          background: '#34ad2b',
          color: 'white',
          '&:hover': {
            background: '#2c8e24',
          },
        }}
        onClick={handleStartCall}
      >
        <i className={'fas fa-phone-alt'} />
      </DialerBtn>
    </div>
  );
};
