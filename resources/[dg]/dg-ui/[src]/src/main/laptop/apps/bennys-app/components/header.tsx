import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Badge } from '@mui/material';

import { Icon } from '../../../../../components/icon';
import { useUpdateState } from '../../../../../lib/redux';

export const HeaderIcon: FC<{ name: string; label: string; isCart?: boolean }> = props => {
  const selected = useSelector<RootState, boolean>(state => state['laptop.bennys'].activeTab === props.name);
  const updateState = useUpdateState('laptop.bennys');
  return (
    <div
      className={['laptop-bennys-header-entry', selected ? 'selected' : ''].join(' ')}
      onClick={() => {
        updateState({
          activeTab: props.name,
        });
      }}
    >
      {props.isCart && <Icon name={'cart-shopping'} size={'1.5vh'} />}
      <p style={props.isCart ? { marginLeft: '.5vh' } : {}}>{props.label}</p>
    </div>
  );
};

export const Header: FC<{}> = () => {
  const hasVPN = useSelector<RootState, boolean>(state => state.character.hasVPN);
  const storeItems = useSelector<RootState, number>(state =>
    Object.values(state['laptop.bennys'].cart).reduce((total, a) => total + a, 0)
  );

  return (
    <div className={'laptop-bennys-header'}>
      <div>
        <HeaderIcon name={'cosmetic'} label={'Cosmetisch'} />
        {hasVPN && <HeaderIcon name={'illegal'} label={'Backdoor'} />}
      </div>
      <div>
        <Badge badgeContent={storeItems} color={'secondary'}>
          <HeaderIcon name={'cart'} label={'Cart'} isCart />
        </Badge>
      </div>
    </div>
  );
};
