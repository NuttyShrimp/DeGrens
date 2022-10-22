import React, { FC, PropsWithChildren } from 'react';
import { useDrag } from 'react-dnd';

import { useActions } from '../../hooks/useActions';

export const AppWindow: FC<
  PropsWithChildren<{
    title: string;
    width: number;
    height?: number;
    name: string;
    onClose?: () => void;
  }>
> = props => {
  const { closeApp, focusApp } = useActions();

  const [, dragRef, previewRef] = useDrag(
    () => ({
      type: 'APP',
      item: { name: props.name ?? '' },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    []
  );

  return (
    <div
      className={'laptop-appwindow'}
      ref={previewRef}
      style={{ width: `${props.width}vh`, height: props.height !== undefined ? `${props.height}vh` : 'auto' }}
      onMouseDown={() => focusApp(props.name)}
    >
      <div className={'topbar'} ref={dragRef}>
        <div>{props.title}</div>
        <div
          onClick={() => {
            if ('onClose' in props && props.onClose) {
              props.onClose();
            } else {
              closeApp(props.name);
            }
          }}
        >
          <i className={'fas fa-xmark'} />
        </div>
      </div>
      <div className='appcontainer'>{props.children}</div>
    </div>
  );
};
