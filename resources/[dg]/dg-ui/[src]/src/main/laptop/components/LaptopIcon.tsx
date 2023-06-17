import { FC } from 'react';
import { Icon } from '@components/icon';

export const LaptopIcon: FC<Laptop.Config.Icon & { dim: number }> = props => {
  return (
    <div
      className={'laptop-icon'}
      style={{
        backgroundColor: props.background,
        width: `${props.dim}vh`,
        height: `${props.dim}vh`,
      }}
    >
      {'element' in props ? (
        props.element
      ) : (
        <Icon name={props.name} lib={props.lib} color={props.color} size={props.size} />
      )}
    </div>
  );
};
