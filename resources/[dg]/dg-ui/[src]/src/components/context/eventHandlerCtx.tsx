import React, { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useRef } from 'react';
import { addLog } from '@main/debuglogs/lib';
import * as Sentry from '@sentry/react';
import { events } from '@src/lib/events';

declare type EventHandlerCtx = Record<string, (data: any) => void>;

const evtHandlerCtx = createContext<{
  addHandler: (app: string, handler: (data: any) => void) => void;
  removeHandler: (app: string) => void;
}>({
  addHandler: () => {
    // placeholder
  },
  removeHandler: () => {
    // placeholder
  },
});

export const EventHandlerProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const handlers = useRef<EventHandlerCtx>(events);
  const addHandler = (app: string, handler: (data: any) => void) => {
    handlers.current[app] = handler;
  };

  const removeHandler = (app: string) => {
    delete handlers.current[app];
  };

  const eventHandler = useCallback(async (e: any) => {
    e.preventDefault();
    if (!Object.keys(handlers.current).includes(e.data.app)) return;
    // if (e.data?.skipSentry) {
    //   handlers[e.data.app](e);
    //   return;
    // }
    // const transaction = Sentry.startTransaction({
    //   name: 'incomingAppEvent',
    //   tags: {
    //     app: e.data.app,
    //   },
    // });
    // Sentry.getCurrentHub().configureScope(scope => {
    //   scope.setSpan(transaction);
    // });
    // const span = transaction.startChild({
    //   op: 'AppWrapper.eventHandler',
    //   description: `Incoming event for ${e.data.app} handled by AppWrapper`,
    //   data: {
    //     eventData: e.data,
    //   },
    // });
    try {
      addLog({ name: `AppWrapper:${e.data.app}`, body: {}, response: e.data, isOk: true });
      await handlers.current[e.data.app](e);
      // span.setStatus('ok');
    } catch (e) {
      // span.setStatus('unknown_error');
      Sentry.captureException(e);
      console.error(e);
    }
    // finally {
    //   span.finish();
    //   transaction.finish();
    // }
  }, []);

  // Handlers can be replaced with a ref what would
  // result in it not being a dependency for this useEffect
  // which makes it potentially even better, To  be tested
  useEffect(() => {
    window.addEventListener('message', eventHandler);
    return () => {
      window.removeEventListener('message', eventHandler);
    };
  }, [eventHandler]);

  return (
    <evtHandlerCtx.Provider
      value={{
        addHandler,
        removeHandler,
      }}
    >
      {children}
    </evtHandlerCtx.Provider>
  );
};

export const useEventHandler = () => {
  const eventHandlerContext = useContext(evtHandlerCtx);
  return {
    addHandler: eventHandlerContext.addHandler,
    removeHandler: eventHandlerContext.removeHandler,
  };
};
