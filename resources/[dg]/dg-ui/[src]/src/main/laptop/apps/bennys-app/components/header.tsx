import React, { FC } from 'react';
import { Badge } from '@mui/material';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { Icon } from '../../../../../components/icon';
import { useBennyAppStore } from '../stores/useBennyAppStore';

export const HeaderIcon: FC<{ name: string; label: string; isCart?: boolean }> = props => {
  const [selected, setActiveTab] = useBennyAppStore(s => [s.activeTab === props.name, s.setActiveTab]);
  return (
    <div
      className={['laptop-bennys-header-entry', selected ? 'selected' : ''].join(' ')}
      onClick={() => {
        setActiveTab(props.name);
      }}
    >
      {props.isCart && <Icon name={'cart-shopping'} size={'1.5vh'} />}
      <p style={props.isCart ? { marginLeft: '.5vh' } : {}}>{props.label}</p>
    </div>
  );
};

export const Header: FC<{}> = () => {
  const hasVPN = useMainStore(s => s.character.hasVPN);
  const storeItems = useBennyAppStore(s => Object.values(s.cart).reduce((total, a) => total + a, 0));

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
