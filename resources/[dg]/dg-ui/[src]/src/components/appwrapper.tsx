import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { nuiAction } from '@lib/nui-comms';
import { store, type } from '@lib/redux';
import { addLog } from '@main/debuglogs/lib';
import makeStyles from '@mui/styles/makeStyles';
import * as Sentry from '@sentry/react';
import { SpanStatus } from '@sentry/tracing/dist/spanstatus';

import { getApp } from '../base-app.config';

declare interface AppWrapperProps {
  appName: string;
  children: any;
  onShow: (data?: any) => void;
  onHide: (data?: any) => void;
  onEvent?: (data: any) => void;
  onEscape?: () => void | boolean;
  onError?: (e?: ErrorEvent) => void;
  center?: boolean;
  column?: boolean;
  full?: boolean;
  style?: Object;
  unSelectable?: boolean;
}

const useStyles = makeStyles({
  // style rule
  wrapper: (props: AppWrapperProps) => ({
    position: 'absolute',
    visibility: 'visible',
    pointerEvents: 'none',
    overflow: 'scroll',
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
      pointerEvents: 'all',
    },
  }),
});

const registeredApps: {
  [appName: string]: {
    onShow: (data?: any) => void;
    onHide: (data?: any) => void;
  };
} = {};

const setCurrentApp = (app: string) => {
  store.dispatch({
    type,
    cb: state => ({
      ...state,
      main: {
        ...state.main,
        currentApp: app,
      },
    }),
  });
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function AppWrapper(props: AppWrapperProps) {
  const mainState = useSelector<RootState, State.Main.State>(state => state.main);
  const styles = useStyles(props);
  const appRef = useRef<HTMLDivElement>(null);
  const appInfo = getApp(props.appName);
  const appState = useSelector<RootState, { visible: boolean }>(state => state[props.appName]);

  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);

  const eventHandler = async (e: any) => {
    if (e.data.app === props.appName) {
      const transaction = Sentry.startTransaction({
        name: `incomingAppEvent`,
        tags: {
          app: props.appName,
        },
      });
      Sentry.getCurrentHub().configureScope(scope => {
        scope.setSpan(transaction);
      });
      const span = transaction.startChild({
        op: 'AppWrapper.eventHandler',
        description: `Incoming event for ${props.appName} handled by AppWrapper`,
        data: {
          eventData: e.data,
        },
      });
      try {
        addLog({ name: `AppWrapper:${props.appName}`, body: {}, response: e.data, isOk: true });
        if (e.data.show) {
          props.onShow(e.data.data);
          if (appInfo?.type === 'interactive' && e.data.shouldFocus) {
            nuiAction('__appwrapper:setfocus');
          }
          return;
        } else if (e.data.show === false) {
          if (visible) {
            if (active) {
              setCurrentApp('');
            }
            props.onHide();
          }
          return;
        }
        if (props.onEvent) {
          props.onEvent(e.data.data);
        }
        span.setStatus(SpanStatus.Ok);
      } catch (e) {
        span.setStatus(SpanStatus.UnknownError);
        throw e;
      } finally {
        span.finish();
        transaction.finish();
      }
    }
  };
  const handlePress: any = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'Escape':
        if (visible) {
          const shouldEvent = props.onEscape ? props.onEscape() ?? true : null;
          if (shouldEvent === true) {
            nuiAction('dg-ui:applicationClosed', {
              app: props.appName,
              fromEscape: true,
            });
          }
        }
        break;
      default:
        break;
    }
  };
  const handleError: any = (e: ErrorEvent) => {
    // store.dispatch(NotificationHandler.newNotification(e.message, 'error'));
    if (props.onError) {
      props.onError(e);
    }
    console.error(e);
    store.dispatch({
      type,
      cb: state => ({
        ...state,
        main: {
          ...state.main,
          error: props.appName,
          mounted: false,
        },
      }),
    });
    nuiAction('reload');
  };
  const handleActiveApp: any = () => {
    setActive(true);
    setCurrentApp(props.appName);
  };

  useEffect(() => {
    window.addEventListener('message', eventHandler);
    window.addEventListener('keydown', handlePress);
    window.addEventListener('error', handleError);
    if (appRef && appRef.current) {
      appRef.current.addEventListener('click', handleActiveApp);
    }
    return () => {
      window.removeEventListener('message', eventHandler);
      window.removeEventListener('keydown', handlePress);
      window.removeEventListener('error', handleError);
      if (appRef && appRef.current) {
        appRef.current.removeEventListener('click', handleActiveApp);
      }
    };
  }, [visible]);

  useEffect(() => {
    registeredApps[props.appName] = {
      onHide: () => {
        if (active) {
          setCurrentApp('');
        }
        setVisible(false);
        props.onHide();
      },
      onShow: props.onShow,
    };
    return () => {
      delete registeredApps[props.appName];
    };
  }, []);

  useEffect(() => {
    if (appState.visible === visible) return;
    setActive(appState.visible);
    setVisible(appState.visible);
    if (appState.visible) {
      setCurrentApp(props.appName);
    }
  }, [appState]);

  useEffect(() => {
    const isActiveApp = mainState.currentApp === props.appName;
    if (isActiveApp === active) return;
    setActive(isActiveApp);
  }, [mainState]);

  useEffect(() => {
    if (!appInfo) {
      throw new Error(`No config found for ${props.appName}`);
    }
  }, [appInfo]);

  return (
    <div
      className={`${styles.wrapper}${visible ? '' : ' hidden'}`}
      style={{ zIndex: active ? 10 : 1, ...(props.style || {}) }}
      data-appwrapper={props.appName}
      ref={appRef}
    >
      {visible && props.children}
    </div>
  );
}

export const closeApplication = (app: string) => {
  if (!registeredApps[app]) {
    new Error('No app with this name registered?');
    return;
  }
  registeredApps[app].onHide();
  nuiAction('dg-ui:applicationClosed', {
    app,
    fromEscape: false,
  });
};
