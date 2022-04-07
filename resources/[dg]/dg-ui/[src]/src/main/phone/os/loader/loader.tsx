import React from 'react';
import { CircularProgress } from '@mui/material';

import './loader.scss';

export const Loader = () => (
  <div className='loader__wrapper'>
    <CircularProgress />
  </div>
);
