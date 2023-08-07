import { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';

import { CallList } from './component/callList';
import { CamList } from './component/camList';
import { useDispatchStore } from './stores/useDispatchStore';
import config from './_config';

import './styles/dispatch.scss';

const Component: AppFunction = props => {
  const [newIds, setNewIds] = useState<string[]>([]);
  const [onlyNew, setOnlyNew] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [addStoreCall, addStoreCalls, setStoreCalls, setStoreCams, setHasCursor] = useDispatchStore(s => [
    s.addCall,
    s.addCalls,
    s.setCalls,
    s.setCams,
    s.setHasCursor,
  ]);

  const onShow = useCallback((data: { onlyNew?: boolean; showCamera?: boolean; hasCursor: boolean }) => {
    setOnlyNew(data?.onlyNew ?? false);
    setShowCamera(data?.showCamera ?? false);
    setHasCursor(data.hasCursor);
    props.showApp();
  }, []);

  const onHide = useCallback(() => {
    props.hideApp();
    setNewIds([]);
    setOnlyNew(false);
    setShowCamera(false);
    setHasCursor(false);
  }, [props]);

  const addCall = useCallback(
    (call: Dispatch.Call) => {
      addStoreCall(call);
      setNewIds(s => [...s, call.id]);
      setTimeout(() => {
        setNewIds(s => s.filter(id => id !== call.id));
      }, 5000);
    },
    [newIds, addStoreCall]
  );

  const addCalls = useCallback(
    (calls: Dispatch.Call[], isRefresh = false) => {
      if (isRefresh) {
        setStoreCalls(calls);
      } else {
        addStoreCalls(calls);
      }
    },
    [addStoreCalls]
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
          setStoreCams(pData.cams);
          break;
        }
        default: {
          throw new Error(`${pData.action} is not a valid dispatch NUI endpoint`);
        }
      }
    },
    [addCall, addCalls]
  );

  return (
    <AppWrapper
      appName={config.name}
      onShow={onShow}
      onHide={onHide}
      onEvent={handleEvent}
      full
      center
      hideOnEscape
      hideOverflow
    >
      <div>
        <CallList newIds={newIds} onlyNew={onlyNew} />
        {showCamera && <CamList />}
      </div>
    </AppWrapper>
  );
};

export default Component;
