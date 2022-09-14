import React, { FC, PropsWithChildren, ReactElement } from 'react';

import { useActions } from '../hooks/useActions';

export const TopBar: FC<PropsWithChildren<{ title?: string | ReactElement; name: string }>> = props => {
  const { closeApp } = useActions();
  return (
    <div className={'laptop-topbar'}>
      <div>{props.title}</div>
      <div onClick={() => closeApp(props.name)}>
        <i className={'fas fa-xmark'} />
      </div>
    </div>
  );
};
