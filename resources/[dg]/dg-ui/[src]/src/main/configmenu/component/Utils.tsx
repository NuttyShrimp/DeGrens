import React, { FC, PropsWithChildren } from 'react';
import { Typography } from '@mui/material';

export const Section: FC<PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <div className={'configmenu-section'}>
    <Typography variant={'h6'}>{title}</Typography>
    {children}
  </div>
);
