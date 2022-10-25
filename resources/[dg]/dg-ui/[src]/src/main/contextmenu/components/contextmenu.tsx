import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { closeApplication } from '../../../components/appwrapper';
import { nuiAction } from '../../../lib/nui-comms';
import store from '../store';

const MenuEntry: FC<
  React.PropsWithChildren<ContextMenu.Entry & Base.Props<ContextMenu.State> & { onClick?: Function }>
> = props => {
  const parentEntry = useSelector<RootState, string[]>(state => state.contextmenu.parentEntry);

  const handleClick = () => {
    let hasSub = false;
    if (props.submenu) {
      props.updateState({
        entries: props.submenu,
        parentEntry: parentEntry ? parentEntry.concat([props.id]) : [props.id],
      });
      hasSub = true;
    }
    if (props.callbackURL) {
      nuiAction(props.callbackURL, props.data);
      if (!hasSub && !props.preventCloseOnClick) {
        closeApplication(store.key);
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
      {props.icon && (props.icon as ContextMenu.Icon).name && (props.icon as ContextMenu.Icon)?.position === 'right' && (
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

export const ContextMenu: AppFunction<ContextMenu.State> = props => {
  const goMenuBack = () => {
    const newEntries = searchForEntries(props.allEntries, [...props.parentEntry]);
    if (newEntries && typeof newEntries !== 'boolean') {
      props.updateState({
        entries: newEntries,
        parentEntry: props.parentEntry.slice(0, -1),
      });
    }
  };

  return (
    <div className='contextmenu_scroll'>
      <div className={'contextmenu__wrapper'}>
        {props.parentEntry.length > 0 && (
          <MenuEntry
            id={`back-${props.parentEntry}`}
            title={'Back'}
            icon={'chevron-left'}
            updateState={props.updateState}
            onClick={goMenuBack}
          />
        )}
        {props.entries.map(entry => (
          <MenuEntry key={entry.id} {...entry} updateState={props.updateState} />
        ))}
      </div>
    </div>
  );
};
