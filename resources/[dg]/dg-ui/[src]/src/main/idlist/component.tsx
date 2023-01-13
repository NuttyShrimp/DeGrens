import React, { useCallback, useRef, useState } from 'react';
import AppWrapper from '@components/appwrapper';
import { Divider } from '@mui/material';

import store from './store';

import './styles/idlist.scss';

const Component: AppFunction<IdList.State> = props => {
  const [selectedEntry, setSelectedEntry] = useState(0);
  const self = useRef({});
  const saveRef = (key: number) => (r: any) => {
    self.current[key] = r;
  };

  const handleShow = useCallback((data: { info: IdList.ScopeInfo }) => {
    setSelectedEntry(0);
    props.updateState(() => ({ visible: true, ...data.info }));
  }, []);
  const handleHide = useCallback(() => {
    props.updateState(() => ({ visible: false }));
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
          const newEntry = Math.min(selectedEntry + 1, props.current.length + props.recent.length - 1);
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
    [props.current, props.recent, selectedEntry]
  );

  const anyCurrent = props.current.length !== 0;
  const anyRecent = props.recent.length !== 0;
  const anyDropped = props.dropped.length !== 0;

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEvent={handleEvent} unSelectable full>
      <div className='id-list-wrapper'>
        {anyCurrent && (
          <>
            <div className='id-list-label'>in scope</div>
            {props.current.map((entry, idx) => (
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
            {props.recent.map((entry, idx) => (
              <div
                ref={saveRef(idx + props.current.length)}
                className={`id-list-entry ${selectedEntry === idx + props.current.length ? 'selected' : ''}`}
                key={`recent-${entry.source}`}
              >
                ({entry.source}): {entry.steamId}
              </div>
            ))}
          </div>
        )}
        {anyRecent && anyDropped && (
          <div className='id-list-divider'>
            <Divider />
          </div>
        )}
        {anyDropped && (
          <div>
            <div className='id-list-label'>left server</div>
            {props.dropped.map((entry, idx) => (
              <div
                ref={saveRef(idx + props.current.length + props.recent.length)}
                className={`id-list-entry ${
                  selectedEntry === idx + props.current.length + props.recent.length ? 'selected' : ''
                }`}
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
