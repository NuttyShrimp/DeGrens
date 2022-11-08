import React, { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { CallList } from './component/callList';
import { CamList } from './component/camList';
import store from './store';

import './styles/dispatch.scss';

const Component: AppFunction<Dispatch.State> = props => {
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [onlyNew, setOnlyNew] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const onShow = useCallback((data: { onlyNew?: boolean; showCamera?: boolean }) => {
    props.updateState({
      visible: true,
    });
    setOnlyNew(data?.onlyNew ?? false);
    setShowCamera(data?.showCamera ?? false);
  }, []);

  const onHide = useCallback(() => {
    props.updateState({
      visible: false,
    });
    setViewedIds(props.calls.map(c => c.id));
    setOnlyNew(false);
    setShowCamera(false);
  }, [props.calls]);

  const addCall = useCallback(
    (call: Dispatch.Call) => {
      const newCalls = [call, ...props.calls].slice(0, props.storeSize);
      props.updateState({
        calls: newCalls,
      });
      setTimeout(() => {
        setViewedIds(s => [...s, call.id]);
      }, 5000);
    },
    [props.calls, props.storeSize, props.updateState]
  );

  const addCalls = useCallback(
    (calls: Dispatch.Call[], isRefresh = false) => {
      const storeSize = isRefresh ? calls.length : props.storeSize + calls.length;
      const newCalls = isRefresh ? calls : [...calls, ...props.calls].slice(0, storeSize);
      props.updateState({
        storeSize,
        calls: newCalls,
      });
      setViewedIds(s => [...s, ...calls.map(c => c.id)]);
    },
    [props.storeSize, props.calls, props.updateState]
  );

  const handleEvent = useCallback(
    (pData: any) => {
      switch (pData.action) {
        case 'addCall': {
          addCall(pData.call);
          break;
        }
        case 'addCalls': {
          addCalls(pData.calls, pData.refresh);
          break;
        }
        case 'addCams': {
          props.updateState({
            cams: pData.cams,
          });
          break;
        }
        default: {
          throw new Error(`${pData.action} is not a valid dispatch NUI endpoint`);
        }
      }
    },
    [addCall]
  );

  return (
    <AppWrapper
      appName={store.key}
      onShow={onShow}
      onHide={onHide}
      onEvent={handleEvent}
      full
      center
      hideOnEscape
      hideOverflow
    >
      <>
        <CallList list={props.calls} viewedIds={viewedIds} onlyNew={onlyNew} />
        {showCamera && <CamList camList={props.cams} />}
      </>
    </AppWrapper>
  );
};

export default Component;
