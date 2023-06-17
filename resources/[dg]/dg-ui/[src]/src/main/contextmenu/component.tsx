import { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { uuidv4 } from '../../lib/util';

import { ContextMenu } from './components/contextmenu';
import { useCtxMenuStore } from './stores/useCtxMenuStore';
import config from './_config';

import './styles/contextmenu.scss';

const Component: AppFunction = props => {
  const [loadEntries, resetEntries] = useCtxMenuStore(s => [s.loadEntries, s.resetEntries]);
  const generateIds = (entries: ContextMenu.Entry[]): ContextMenu.Entry[] => {
    const ids: string[] = [];
    const getId = (): string => {
      let id = uuidv4();
      while (ids.indexOf(id) !== -1) {
        id = uuidv4();
      }
      return id;
    };
    entries.forEach(entry => {
      if (!entry.id) return;
      ids.push(entry.id);
    });
    return entries.map(entry => {
      entry.id = entry.id ?? getId();
      if (entry.submenu) {
        entry.submenu = generateIds(entry.submenu);
      }
      return entry;
    });
  };

  const onShow = useCallback((data: ContextMenu.Entry[]) => {
    data = generateIds(data);
    props.showApp();
    loadEntries(data);
  }, []);

  const onHide = useCallback(() => {
    props.hideApp();
    resetEntries();
  }, []);

  return (
    <AppWrapper appName={config.name} onShow={onShow} onHide={onHide} full hideOnEscape>
      <ContextMenu />
    </AppWrapper>
  );
};

export default Component;
