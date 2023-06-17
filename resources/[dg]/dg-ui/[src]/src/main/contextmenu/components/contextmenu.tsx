import { FC } from 'react';
import * as React from 'react';

import { closeApplication } from '../../../components/appwrapper';
import { nuiAction } from '../../../lib/nui-comms';
import config from '../_config';
import { useCtxMenuStore } from '../stores/useCtxMenuStore';

const MenuEntry: FC<React.PropsWithChildren<ContextMenu.Entry & { onClick?: Function }>> = props => {
  const [parentEntry, setEntries] = useCtxMenuStore(s => [s.parentEntry, s.setEntries]);
  const handleClick = () => {
    let hasSub = false;
    if (props.submenu) {
      setEntries(props.submenu, parentEntry ? parentEntry.concat([props.id]) : [props.id]);
      hasSub = true;
    }
    if (props.callbackURL) {
      nuiAction(props.callbackURL, props.data);
      if (!hasSub && !props.preventCloseOnClick) {
        closeApplication(config.name);
      }
    }
    if (props.onClick) {
      props.onClick();
    }
  };

  return (
    <div
      className={`entry ${props.disabled ? 'disabled' : ''}`}
      onClick={(!props.disabled && handleClick) || undefined}
    >
      {props.icon && typeof props.icon === 'string' && (
        <div className={'icon'}>
          <i className={`fas fa-${props.icon}`}></i>
        </div>
      )}
      {props.icon && (props.icon as ContextMenu.Icon).name && (props.icon as ContextMenu.Icon)?.position === 'left' && (
        <div className={'icon'} style={{ color: (props.icon as ContextMenu.Icon)?.color ?? 'inherit' }}>
          <i className={`fas fa-${(props.icon as ContextMenu.Icon).name}`}></i>
        </div>
      )}
      <div className={'textWrapper'}>
        <div className={'title'}>{props.title}</div>
        {props.description && <div className={'description'}>{props.description}</div>}
      </div>
      {props.icon &&
        (props.icon as ContextMenu.Icon).name &&
        (props.icon as ContextMenu.Icon)?.position === 'right' && (
          <div className={'icon'} style={{ color: (props.icon as ContextMenu.Icon)?.color ?? 'inherit' }}>
            <i
              className={`${(props.icon as ContextMenu.Icon).lib ?? 'fas'} fa-${(props.icon as ContextMenu.Icon).name}`}
            />
          </div>
        )}
      {props.submenu && (
        <div className={'icon'}>
          <i className={'fas fa-chevron-right'} />
        </div>
      )}
    </div>
  );
};

const searchForEntries = (entries: ContextMenu.Entry[], keys: string[]): ContextMenu.Entry[] | boolean => {
  const keyToSearch = keys.shift();
  if (!keyToSearch) {
    return entries;
  }
  const entry = entries.find(entry => entry.id === keyToSearch);
  if (!entry) {
    return false;
  }
  if (keys.length === 0) {
    return entries;
  }
  if (entry?.submenu) {
    return searchForEntries(entry.submenu, keys);
  }
  return false;
};

export const ContextMenu = () => {
  const [entries, allEntries, parentEntry, setEntries] = useCtxMenuStore(s => [
    s.entries,
    s.allEntries,
    s.parentEntry,
    s.setEntries,
  ]);
  const goMenuBack = () => {
    const newEntries = searchForEntries(allEntries, [...parentEntry]);
    if (newEntries && typeof newEntries !== 'boolean') {
      setEntries(newEntries, parentEntry.slice(0, -1));
    }
  };

  return (
    <div className='contextmenu_scroll'>
      <div className={'contextmenu__wrapper'}>
        {parentEntry.length > 0 && (
          <MenuEntry id={`back-${parentEntry}`} title={'Back'} icon={'chevron-left'} onClick={goMenuBack} />
        )}
        {entries.map(entry => (
          <MenuEntry key={entry.id} {...entry} />
        ))}
      </div>
    </div>
  );
};
