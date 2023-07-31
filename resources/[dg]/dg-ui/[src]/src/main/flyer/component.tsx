import { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import config from './_config';
import { TYPES } from './constants';

import './styles/badge.scss';

const Component: AppFunction = props => {
  const [link, setLink] = useState<null | string>(null);
  const [badge, setBadge] = useState<null | { type: Badge.Type; name: string }>(null);

  const handleShow = useCallback((data: { type: Badge.Type; name: string } | { link: string }) => {
    if ('link' in data) {
      setLink(data.link);
    } else {
      setBadge(data);
    }
    props.showApp();
  }, []);
  const handleHide = useCallback(() => {
    setLink(null);
    setBadge(null);
    props.hideApp();
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} unSelectable center>
      <div className='badge'>
        <div>
          {badge && (
            <>
              <img src={TYPES[badge.type].image} alt={'badge'} />
              <p style={{ top: `${TYPES[badge.type].top}vh`, left: `${TYPES[badge.type].left}vh` }}>{badge.name}</p>
            </>
          )}
          {link && <img src={link} alt={'badge'} />}
        </div>
      </div>
    </AppWrapper>
  );
};

export default Component;
