import React, { useCallback, useRef, useState } from 'react';
import AppWrapper from '@components/appwrapper';
import { Divider } from '@mui/material';

import { useIdListStore } from './stores/useIdlistStore';
import config from './_config';

import './styles/idlist.scss';

const Component: AppFunction = props => {
  const [current, recent, setList] = useIdListStore(s => [s.current, s.recent, s.setList]);
  const [selectedEntry, setSelectedEntry] = useState(0);
  const self = useRef({});
  const saveRef = (key: number) => (r: any) => {
    self.current[key] = r;
  };

  const handleShow = useCallback((data: { info: IdList.ScopeInfo }) => {
    setSelectedEntry(0);
    props.showApp();
    setList(data.info);
  }, []);
  const handleHide = useCallback(() => {
    props.hideApp();
  }, []);

  const handleEvent = useCallback(
    data => {
      if (!data.direction) return;
      switch (data.direction) {
        case 'up': {
          setSelectedEntry(v => Math.max(0, v - 1));
          break;
        }
        case 'down': {
          const newEntry = Math.min(selectedEntry + 1, current.length + recent.length - 1);
          self.current[newEntry]?.scrollIntoView({
            block: 'center',
          });
          setSelectedEntry(newEntry);
          break;
        }
        default: {
          throw new Error(`${data.direction} is not a valid direction`);
        }
      }
    },
    [current, recent, selectedEntry]
  );

  const anyCurrent = current.length !== 0;
  const anyRecent = recent.length !== 0;

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} onEvent={handleEvent} unSelectable full>
      <div className='id-list-wrapper'>
        {anyCurrent && (
          <>
            <div className='id-list-label'>in scope</div>
            {current.map((entry, idx) => (
              <div
                ref={saveRef(idx)}
                className={`id-list-entry ${selectedEntry === idx ? 'selected' : ''}`}
                key={entry.source}
              >
                ({entry.source}): {entry.steamId}
              </div>
            ))}
          </>
        )}
        {anyCurrent && anyRecent && (
          <div className='id-list-divider'>
            <Divider />
          </div>
        )}
        {anyRecent && (
          <div>
            <div className='id-list-label'>recently seen</div>
            {recent.map((entry, idx) => (
              <div
                ref={saveRef(idx + current.length)}
                className={`id-list-entry ${selectedEntry === idx + current.length ? 'selected' : ''}`}
                key={`recent-${entry.source}`}
              >
                ({entry.source}): {entry.steamId}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppWrapper>
  );
};

export default Component;
