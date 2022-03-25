import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { closeApplication } from '../../../components/appwrapper';
import { nuiAction } from '../../../lib/nui-comms';
import store from '../store';

const MenuEntry: FC<ContextMenu.Entry & State.BaseProps & { onClick?: Function }> = props => {
  const parentEntry = useSelector<RootState, string | null>(state => state.contextmenu.parentEntry);

  const handleClick = () => {
    let hasSub = false;
    if (props.submenu) {
      props.updateState({
        entries: props.submenu,
        parentEntry: parentEntry ? `${parentEntry}.${props.id}` : props.id,
      });
      hasSub = true;
    }
    if (props.callbackURL) {
      nuiAction(props.callbackURL, props.data);
      if (!hasSub) {
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
          <i className={`fas fa-chevron-right`} />
        </div>
      )}
    </div>
  );
};

export const ContextMenu: FC<ContextMenu.Props> = props => {
  const goMenuBack = () => {
    const keys = (props.parentEntry ?? '').split('.');
    const searchForEntries = (entries: ContextMenu.Entry[], key = 0): ContextMenu.Entry[] | boolean => {
      if (entries.length === 0) {
        return false;
      }
      if (key === keys.length) {
        return true;
      }
      const entry = entries.find(entry => entry.id === keys[key]);
      if (entry?.submenu) {
        const hasFound = searchForEntries(entry.submenu, key + 1);
        return hasFound ? entries : false;
      }
      return [];
    };
    const newEntries = searchForEntries(props.allEntries);
    if (newEntries) {
      keys.pop();
      props.updateState({
        entries: newEntries,
        parentEntry: newEntries ? keys.join('.') : null,
      });
    }
  };

  return (
    <div className={'contextmenu__wrapper'}>
      {props.parentEntry && (
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
  );
};
