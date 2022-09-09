import React, { useEffect } from 'react';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { DebtList } from './components/debtList';

const Component: AppFunction<Phone.Debt.State> = props => {
  const fetchDebts = async () => {
    const debts = await nuiAction<Phone.Debt.Debt[]>('phone/debts/get', {}, devData.phoneDebtEntry);
    props.updateState({
      list: debts,
    });
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  return (
    <AppContainer emptyList={props.list.length === 0}>
      <DebtList list={props.list} />
    </AppContainer>
  );
};

export default Component;
