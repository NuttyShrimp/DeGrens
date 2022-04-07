import React, { FC, MouseEventHandler } from 'react';
import MUIIcon from '@mui/material/Icon';
import { SxProps } from '@mui/system';

declare interface IconProps {
  name: string;
  lib?: string;
  size?: string;
  color?: string;
  style?: SxProps;
  onClick?: MouseEventHandler<HTMLElement>;
}

export const Icon: FC<IconProps> = props => {
  if (props.lib == 'img') {
    return (
      <div style={{ width: props.size }}>
        <img
          src={props.name}
          alt={'Icon img'}
          style={{ width: '100%', cursor: props.onClick ? 'poiner' : 'auto' }}
          onClick={props.onClick}
        />
      </div>
    );
  }
  if (props.lib == 'svg') {
    return (
      <MUIIcon
        sx={{
          textAlign: 'center',
          height: props.size,
          cursor: props.onClick ? 'poiner' : 'auto',
        }}
        onClick={props.onClick}
      >
        <img
          src={props.name}
          alt={'svgIcon'}
          style={{
            height: '100%',
          }}
        />
      </MUIIcon>
    );
  }
  if (props.lib == 'mdi' || props.name.startsWith('mdi-')) {
    return (
      <MUIIcon
        baseClassName={'mdi'}
        className={props.name.startsWith('mdi-') ? props.name : `mdi-${props.name}`}
        sx={{
          ...(props?.style ?? {}),
          color: props.color ?? 'inherit',
          fontSize: props.size ?? '1.5rem',
          cursor: props.onClick ? 'poiner' : 'auto',
        }}
        onClick={props.onClick}
      />
    );
  }
  if ((props.lib && ['mi', 'material-icons'].includes(props.lib)) || props.name.startsWith('mi-')) {
    return (
      <MUIIcon
        sx={{
          ...(props?.style ?? {}),
          color: props.color ?? 'inherit',
          fontSize: props.size ?? '1.5rem',
          cursor: props.onClick ? 'poiner' : 'auto',
        }}
        onClick={props.onClick}
      >
        {props.name.startsWith('mi-') ? props.name.replace(/^mi-/, '') : props.name}
      </MUIIcon>
    );
  }
  return (
    <MUIIcon
      baseClassName={props?.lib ?? 'fas'}
      className={`fa-${props.name}`}
      sx={{
        ...(props?.style ?? {}),
        color: props.color ?? 'inherit',
        fontSize: props.size ?? '1.5rem',
        cursor: props.onClick ? 'poiner' : 'auto',
      }}
      onClick={props.onClick}
    />
  );
};
