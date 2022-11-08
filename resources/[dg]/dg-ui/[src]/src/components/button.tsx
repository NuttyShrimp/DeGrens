import React from 'react';
import MuiButton, { ButtonProps } from '@mui/material/Button';
import MuiIconButton, { IconButtonProps } from '@mui/material/IconButton';

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

export const IconButton: Record<string, React.FC<React.PropsWithChildren<IconButtonProps>>> = {};

IconButton.Primary = (props: IconButtonProps) => {
  return (
    <MuiIconButton size={'small'} {...props} color={'primary'}>
      {props.children}
    </MuiIconButton>
  );
};

IconButton.Secondary = (props: IconButtonProps) => {
  return (
    <MuiIconButton size={'small'} {...props} color={'secondary'}>
      {props.children}
    </MuiIconButton>
  );
};
