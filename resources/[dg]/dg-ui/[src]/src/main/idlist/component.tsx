import React, { useCallback, useRef, useState } from 'react';
import AppWrapper from '@components/appwrapper';

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

  return (
    <AppWrapper appName={store.key} onShow={handleShow} onHide={handleHide} onEvent={handleEvent} unSelectable full>
      <div className='id-list-wrapper'>
        {props.current.map((entry, idx) => (
          <div
            ref={saveRef(idx)}
            className={`id-list-entry ${selectedEntry === idx ? 'selected' : ''}`}
            key={entry.source}
          >
            ({entry.source}): {entry.steamId}
          </div>
        ))}
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
    </AppWrapper>
  );
};

export default Component;
