import React, { useCallback, useEffect, useRef, useState } from 'react';
import { nuiAction } from '@lib/nui-comms';
import makeStyles from '@mui/styles/makeStyles';
import * as Sentry from '@sentry/react';
import { useMainStore } from '@src/lib/stores/useMainStore';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import { useApps } from '../lib/hooks/useApps';

import { useEventHandler } from './context/eventHandlerCtx';

declare interface AppWrapperProps {
  appName: keyof RootState;
  children: any;
  onShow: (data?: any) => void;
  onHide: (data?: any) => void;
  onEvent?: (data: any) => void;
  hideOnEscape?: boolean;
  onEscape?: () => void | boolean;
  onError?: (e?: Error) => void;
  center?: boolean;
  column?: boolean;
  full?: boolean;
  hideOverflow?: boolean;
  style?: Object;
  unSelectable?: boolean;
}

const useStyles = makeStyles({
  // style rule
  wrapper: (props: AppWrapperProps) => ({
    position: 'absolute',
    visibility: 'visible',
    pointerEvents: 'none',
    overflow: props.hideOverflow ? 'hidden' : 'scroll',
    opacity: 1,
    display: 'block',
    ...(props.full && {
      width: '100vw',
      height: '100vh',
    }),
    ...((props.center || props.column) && {
      display: 'flex',
      alignItems: 'center',
    }),
    ...(props.center && {
      justifyContent: 'center',
      width: '100vw',
    }),
    ...(props.column && {
      flexDirection: 'column',
      justifyContent: 'flex-start',
    }),
    ...(props.unSelectable && {
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }),
    '& > *': {
      pointerEvents: 'auto',
    },
  }),
});

const registeredApps: {
  [appName: string]: {
    showApp: (data?: { data?: any; shouldFocus?: boolean }) => void; // Not currently used
    hideApp: (data?: any) => void;
  };
} = {};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function AppWrapper(props: AppWrapperProps) {
  const [setCurrentApp, currentApp, setError] = useMainStore(s => [s.setCurrentApp, s.currentApp, s.setError]);
  const styles = useStyles(props);
  const { getApp } = useApps();
  const { addHandler, removeHandler } = useEventHandler();
  const appInfo = getApp(props.appName);
  const appVisible = useVisibleStore(s => s.visibleApps.includes(props.appName));

  const [active, setActive] = useState(false);

  // region Handler Refs
  const onShow = useRef(props.onShow);
  const onHide = useRef(props.onHide);
  const onEvent = useRef(props.onEvent);
  const onEscape = useRef(props.onEscape);
  const onError = useRef(props.onError);

  useEffect(() => {
    onShow.current = props.onShow;
  }, [props.onShow]);

  useEffect(() => {
    onHide.current = props.onHide;
  }, [props.onHide]);

  useEffect(() => {
    onEvent.current = props.onEvent;
  }, [props.onEvent]);

  useEffect(() => {
    onEscape.current = props.onEscape;
  }, [props.onEscape]);

  useEffect(() => {
    onError.current = props.onError;
  }, [props.onError]);
  // endregion

  const hideApp = useCallback<AppWrapperProps['onHide']>(
    (data?: any) => {
      // cache apptype before hadnling onhide of funciton incase it changes dynamic type whgich would cause focus not getting removed
      const appType = appInfo.type instanceof Function ? appInfo.type() : appInfo.type;
      onHide.current(data);

      nuiAction('dg-ui:applicationClosed', {
        app: appInfo.name,
        type: appType,
      });
    },
    [appInfo]
  );

  const showApp = useCallback<AppWrapperProps['onShow']>(
    (data?: { data?: any; shouldFocus?: boolean }) => {
      onShow.current(data?.data);

      // Check apptype to set focus
      if (!data?.shouldFocus) return;
      const appType = appInfo.type instanceof Function ? appInfo.type() : appInfo.type;
      if (appType === 'interactive') {
        nuiAction('__appwrapper:setfocus');
      }
    },
    [appInfo]
  );

  const eventHandler = useCallback(
    (e: any) => {
      if (e.data.show) {
        showApp(e.data);
        return;
      } else if (e.data.show === false) {
        hideApp();
        return;
      }
      if (onEvent.current) {
        onEvent.current(e.data.data);
      }
    },
    [hideApp, showApp]
  );

  // Handles escape
  const handlePress: any = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'Escape':
          if (appVisible && active) {
            if (onEscape.current) {
              const shouldClose = onEscape.current();
              if (shouldClose === true) {
                hideApp();
              }
              return;
            }
            if (props.hideOnEscape) {
              hideApp();
              return;
            }
          }
          break;
        default:
          break;
      }
    },
    [appVisible, active]
  );

  const handleError: any = (e: Error) => {
    if (onError.current) {
      onError.current(e);
    }
    console.error(e);
    setError(props.appName);
  };

  const handleActiveApp: any = () => {
    const appType = appInfo.type instanceof Function ? appInfo.type() : appInfo.type;
    if (appType === 'passive') return;
    if (active) return;
    setCurrentApp(props.appName);
  };

  useEffect(() => {
    window.addEventListener('keydown', handlePress);
    return () => {
      window.removeEventListener('keydown', handlePress);
    };
  }, [handlePress]);

  // Saved hide and show functions to use outside AppWrapper (closeApplication function)
  useEffect(() => {
    registeredApps[props.appName] = { hideApp, showApp };
    return () => {
      delete registeredApps[props.appName];
    };
  }, [hideApp, showApp]);

  useEffect(() => {
    if (appVisible) {
      setCurrentApp(props.appName);
    } else {
      if (active) {
        setCurrentApp('');
      }
    }
  }, [appVisible]);

  useEffect(() => {
    const isActiveApp = currentApp === props.appName;
    if (isActiveApp === active) return;
    setActive(isActiveApp);
  }, [currentApp]);

  useEffect(() => {
    addHandler(props.appName, eventHandler);
    return () => removeHandler(props.appName);
  }, [eventHandler]);

  return (
    <Sentry.ErrorBoundary onError={handleError} fallback={<div>{props.appName} has crashed, restart your ui</div>}>
      <div
        className={`${styles.wrapper}${appVisible ? '' : ' hidden'}`}
        style={{ zIndex: active ? 10 : 1, ...(props.style || {}) }}
        data-appwrapper={props.appName}
        onClick={handleActiveApp}
      >
        {appVisible && props.children}
      </div>
    </Sentry.ErrorBoundary>
  );
}

// Close application from within a component
export const closeApplication = (app: string) => {
  if (!registeredApps[app]) {
    new Error('No app with this name registered?');
    return;
  }
  registeredApps[app].hideApp();
};
