import { FC } from 'react';

export const Button: FC<{
  onClick?: () => void;
  label: string;
  color?: string;
  size?: string;
}> = props => {
  return (
    <div
      className={'laptop-bennys-btn'}
      style={{ borderColor: props.color, fontSize: props.size }}
      onClick={props.onClick}
    >
      {props.label}
    </div>
  );
};
