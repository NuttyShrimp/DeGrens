import { useCallback, useRef, useState } from 'react';
import AppWrapper from '@components/appwrapper';
import { Divider } from '@mui/material';

import config from './_config';

import './styles/idlist.scss';

const typeToLabel = {
  current: 'in scope',
  recent: 'recently seen',
  dropped: 'left server',
};

const Component: AppFunction = props => {
  const [list, setList] = useState<IdList.ScopeInfo>({});
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
          const newEntry = Math.min(
            selectedEntry + 1,
            Object.values(list).reduce((num, plys) => num + plys.length, 0) - 1
          );
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
    [list, selectedEntry]
  );

  const generateFromList = () => {
    const elements: JSX.Element[] = [];

    let idx = 0;
    Object.entries(list).map(([scopeType, scopePlayers], listIdx) => {
      if (listIdx !== 0) {
        elements.push(
          <div className='id-list-divider' key={`divider_${listIdx}`}>
            <Divider />
          </div>
        );
      }

      elements.push(
        <div className='id-list-label' key={`label_${listIdx}`}>
          {typeToLabel[scopeType] ?? 'Unknown Type'}
        </div>
      );

      for (const scopePlayer of scopePlayers) {
        const elementIdx = idx;
        elements.push(
          <div
            ref={saveRef(elementIdx)}
            className={`id-list-entry ${selectedEntry === elementIdx ? 'selected' : ''}`}
            key={`entry_${elementIdx}`}
          >
            ({scopePlayer.source}): {scopePlayer.steamId}
          </div>
        );
        idx++;
      }
    });

    return elements;
  };

  return (
    <AppWrapper appName={config.name} onShow={handleShow} onHide={handleHide} onEvent={handleEvent} unSelectable full>
      <div className='id-list-wrapper'>{generateFromList()}</div>
    </AppWrapper>
  );
};

export default Component;
