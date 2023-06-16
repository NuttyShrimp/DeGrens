import { FC, MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { useVhToPixel } from '@lib/hooks/useVhToPixel';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Fade, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';

import { baseStyle } from '../../../../base.styles';
import { Input } from '../../../../components/inputs';
import { getPhoneApp } from '../../config';
import { usePhoneStore } from '../../stores/usePhoneStore';

import { styles } from './appcontainer.styles';

declare interface AppContainerProps extends Phone.AppContainer.Props {
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
}

export const AppContainer: FC<React.PropsWithChildren<AppContainerProps>> = props => {
  const classes = styles();
  const wrapperTop = useVhToPixel(1);
  const activeApp = usePhoneStore(s => s.activeApp);

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const [topPadding, setTopPadding] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>('');
  const rootWrapperRef = useRef<HTMLDivElement>(null);
  const actionWrapperRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);
  const handleAuxClick: MouseEventHandler<HTMLDivElement> = e => {
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSearchChange = (val: string) => {
    if (!props.search) return;
    setSearchValue(val);
    if (!val) {
      props.search.onChange(props.search.list);
      return;
    }
    const list = props.search.list.filter(item => {
      for (const field of props.search?.filter ?? []) {
        const v = typeof field === 'function' ? field(item) : item[field];
        if (v && v.toString().toLowerCase().indexOf(val.toLowerCase()) !== -1) {
          return true;
        }
      }
      return false;
    });
    props.search.onChange(list);
  };

  useEffect(() => {
    let padding = 0;
    if (actionWrapperRef.current) {
      padding = actionWrapperRef.current.getBoundingClientRect().height;
    }
    if (inputWrapperRef.current) {
      const inputPadding = inputWrapperRef.current.getBoundingClientRect().height;
      padding = padding < inputPadding ? inputPadding : padding;
    }
    if (padding > 0) {
      padding += wrapperTop;
    }
    setTopPadding(padding);
  }, [actionWrapperRef]);

  const doAction = useCallback(
    (type: 'primary' | 'secondary', idx: number) => {
      let acts: Action[] = [];
      if (type === 'primary' && props.primaryActions) {
        acts = props.primaryActions;
      } else if (type === 'secondary' && props.auxActions) {
        acts = props.auxActions;
      }
      acts[idx]?.onClick(acts[idx]?.data);
    },
    [props.auxActions, props.primaryActions]
  );

  return (
    <div className={[classes.wrapper, props.className ?? ''].join(' ')} style={props.style}>
      <div
        style={{
          height: topPadding,
          backgroundColor:
            typeof getPhoneApp(activeApp)?.background === 'string'
              ? (getPhoneApp(activeApp)?.background as string)
              : baseStyle.primaryDarker.darker,
        }}
        ref={rootWrapperRef}
      >
        {(props.primaryActions || props.auxActions || (props.onClickBack && !(props.search || props.input))) && (
          <div
            className={classes.actionWrapper}
            ref={actionWrapperRef}
            style={{
              width: rootWrapperRef.current ? rootWrapperRef.current.getBoundingClientRect().width : 'initial',
            }}
          >
            {props.onClickBack && !(props.search || props.input) && (
              <Tooltip title='Terug'>
                <div className={classes.backAction} onClick={props.onClickBack}>
                  <ChevronLeftIcon />
                </div>
              </Tooltip>
            )}
            <div className={classes.innerActionWrapper}>
              {props.primaryActions &&
                props.primaryActions.map((action, index) => (
                  <Tooltip key={index} title={action.title} placement='bottom'>
                    <div className={classes.action} onClick={() => doAction('primary', index)}>
                      <i className={`${action.iconLib ?? 'fas'} fa-${action.icon}`} />
                    </div>
                  </Tooltip>
                ))}
              {props.auxActions && props.auxActions.length > 0 && (
                <>
                  <div className={classes.action} onClick={handleAuxClick}>
                    <i className={'fas fa-ellipsis-v'} />
                  </div>
                  <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    keepMounted
                    onClose={handleClose}
                    TransitionComponent={Fade}
                    open={open}
                  >
                    {props.auxActions.map((action, index) => (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          doAction('secondary', index);
                          handleClose();
                        }}
                      >
                        <ListItemIcon style={{ minWidth: 32 }}>
                          <i className={`fas fa-${action.icon}`} />
                        </ListItemIcon>
                        <Typography variant={'body2'}>{action.title}</Typography>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
            </div>
          </div>
        )}
        {(props.onClickBack || props.search || props.input) && (
          <div className={classes.inputsWrapper} ref={inputWrapperRef}>
            {props.onClickBack && (props.search || props.input) && (
              <Tooltip title={'Terug'}>
                <div className={'back-btn'}>
                  <ChevronLeftIcon onClick={props.onClickBack} />
                </div>
              </Tooltip>
            )}
            <div className={classes.innerInputWrapper}>
              {props.input && <Input.TextField {...props.input} />}
              {props.search && <Input.Search value={searchValue} onChange={handleSearchChange} />}
            </div>
          </div>
        )}
      </div>
      <div className={[classes.container, props.containerClassName ?? ''].join(' ')} style={props.containerStyle}>
        {props.emptyList ? (
          <div className={'emptylist'}>
            <i className='fas fa-frown' />
            <p>Niks te tonen</p>
          </div>
        ) : (
          props.children
        )}
      </div>
    </div>
  );
};
