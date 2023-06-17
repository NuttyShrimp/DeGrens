import { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import config from './_config';
import { TYPES } from './constants';

import './styles/badge.scss';

const Component: AppFunction = props => {
  const [type, setType] = useState<Badge.Type>('police');
  const [name, setName] = useState('');

  const handleShow = useCallback((data: { type: Badge.Type; name: string }) => {
    setType(data.type);
    setName(data.name);
    props.showApp();
  }, []);
  const handleHide = useCallback(() => {
    props.hideApp();
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} unSelectable center>
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
