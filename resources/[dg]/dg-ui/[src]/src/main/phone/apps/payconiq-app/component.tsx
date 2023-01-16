import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';

import { Payconiq } from './components/payconiq';
import { usePayconiqAppStore } from './stores/usePayconiqAppStore';

const Component = () => {
  const [setList, setDirty, dirty] = usePayconiqAppStore(s => [s.setList, s.setDirty, s.dirty]);
  const fetchList = async () => {
    const trans = await nuiAction('phone/payconiq/get', {}, devData.bankTrans);
    setList(trans);
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!dirty) return;
    fetchList();
    setDirty(false);
  }, [dirty]);

  return <Payconiq />;
};

export default Component;
