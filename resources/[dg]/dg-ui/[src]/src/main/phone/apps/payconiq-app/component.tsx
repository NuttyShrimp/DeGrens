import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';

import { Payconiq } from './components/payconiq';

const Component: AppFunction<Phone.PayConiq.State> = props => {
  const fetchList = async () => {
    const trans = await nuiAction('phone/payconiq/get', {}, devData.bankTrans);
    props.updateState({
      list: trans,
    });
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (!props.dirty) return;
    fetchList();
    props.updateState({
      dirty: false,
    });
  }, [props.dirty]);

  return <Payconiq {...props} />;
};

export default Component;
