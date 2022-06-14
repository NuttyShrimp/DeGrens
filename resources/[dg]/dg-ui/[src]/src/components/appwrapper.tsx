import React, { useEffect, useState } from 'react';
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
  const mainStateApp = useSelector<RootState, string>(state => state.main.currentApp);
  const styles = useStyles(props);
  const appInfo = getApp(props.appName);
  const appState = useSelector<RootState, { visible: boolean }>(state => state[props.appName]);

  const [active, setActive] = useState(false);

  const eventHandler = async (e: any) => {
    e.preventDefault();
    if (e.data.app === props.appName) {
      const transaction = Sentry.startTransaction({
        name: 'fincomingAppEvent',
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
          if (appState.visible) {
            if (active || mainStateApp === 'cli') {
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
        if (appState.visible && active) {
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

  const handleError: any = (e: Error) => {
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
  };
  const handleActiveApp: any = () => {
    setActive(true);
    setCurrentApp(props.appName);
  };

  useEffect(() => {
    window.addEventListener('message', eventHandler);
    window.addEventListener('keydown', handlePress);
    registeredApps[props.appName] = {
      onHide: () => {
        if (active) {
          setCurrentApp('');
        }
        props.onHide();
      },
      onShow: props.onShow,
    };
    return () => {
      window.removeEventListener('message', eventHandler);
      window.removeEventListener('keydown', handlePress);
      delete registeredApps[props.appName];
    };
  }, [active, props.appName, props.onHide, props.onShow]);

  useEffect(() => {
    setActive(appState.visible);
    if (appState.visible) {
      setCurrentApp(props.appName);
    }
  }, [appState.visible]);

  useEffect(() => {
    const isActiveApp = mainStateApp === props.appName;
    if (isActiveApp === active) return;
    setActive(isActiveApp);
  }, [mainStateApp]);

  useEffect(() => {
    if (!appInfo) {
      throw new Error(`No config found for ${props.appName}`);
    }
  }, [appInfo]);

  return (
    <Sentry.ErrorBoundary onError={handleError} fallback={<div>{props.appName} has crashed, restart your ui</div>}>
      <div
        className={`${styles.wrapper}${appState.visible ? '' : ' hidden'}`}
        style={{ zIndex: active ? 10 : 1, ...(props.style || {}) }}
        data-appwrapper={props.appName}
        onClick={handleActiveApp}
      >
        {appState.visible && props.children}
      </div>
    </Sentry.ErrorBoundary>
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
