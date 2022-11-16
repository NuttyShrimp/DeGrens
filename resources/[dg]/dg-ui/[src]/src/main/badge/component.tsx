import React, { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { TYPES } from './constants';
import store from './store';

import './styles/badge.scss';

const Component: AppFunction<Badge.State> = props => {
  const [type, setType] = useState<Badge.Type>('police');
  const [name, setName] = useState('');

  const handleShow = useCallback((data: { type: Badge.Type; name: string }) => {
    setType(data.type);
    setName(data.name);
    props.updateState(() => ({ visible: true }));
  }, []);
  const handleHide = useCallback(() => {
    props.updateState(() => ({ visible: false }));
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} unSelectable center>
      <div className='badge'>
        <div>
          <img src={TYPES[type].image} alt={'badge'} />
          <p style={{ top: `${TYPES[type].top}vh`, left: `${TYPES[type].left}vh` }}>{name}</p>
        </div>
      </div>
    </AppWrapper>
  );
};

export default Component;
