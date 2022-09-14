import React, { FC } from 'react';
import { Divider } from '@mui/material';

import { TopBar } from '../../components/TopBar';

import '../../styles/gang.scss';

export const Component: FC = () => {
  return (
    <div className={'laptop-gang-shell'}>
      <TopBar name={'gang'} />
      <Divider />
      <p>Gang Gang</p>
    </div>
  );
};
