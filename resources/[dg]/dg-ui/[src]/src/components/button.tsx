import React from 'react';
import MuiButton, { ButtonProps } from '@mui/material/Button';

export const Button: Record<string, React.FC<React.PropsWithChildren<ButtonProps>>> = {};

Button.Primary = (props: ButtonProps) => {
  return (
    <MuiButton variant={'contained'} size={'small'} {...props} color={'primary'}>
      {props.children}
    </MuiButton>
  );
};

Button.Secondary = (props: ButtonProps) => {
  return (
    <MuiButton variant={'contained'} size={'small'} {...props} color={'secondary'}>
      {props.children}
    </MuiButton>
  );
};
