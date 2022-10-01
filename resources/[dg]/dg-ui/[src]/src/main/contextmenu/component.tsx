import React, { useCallback } from 'react';
import AppWrapper from '@components/appwrapper';

import { uuidv4 } from '../../lib/util';

import { ContextMenu } from './components/contextmenu';
import store from './store';

import './styles/contextmenu.scss';

const Component: AppFunction<ContextMenu.State> = props => {
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
    props.updateState({
      visible: true,
      entries: data,
      allEntries: data,
      parentEntry: [],
    });
  }, [])

  const onHide = useCallback(() => {
    props.updateState({
      visible: false,
      entries: [],
      allEntries: [],
      parentEntry: [],
    });
  }, []);

  return (
    <AppWrapper appName={store.key} onShow={onShow} onHide={onHide} full hideOnEscape>
      <ContextMenu {...props} />
    </AppWrapper>
  );
};

export default Component;
