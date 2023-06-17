import { useEffect } from 'react';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { DebtList } from './components/debtList';
import { useDebtAppStore } from './stores/useDebtAppStore';

const Component = () => {
  const [setList, listLen] = useDebtAppStore(s => [s.setList, s.list.length]);
  const fetchDebts = async () => {
    const debts = await nuiAction<Phone.Debt.Debt[]>('phone/debts/get', {}, devData.phoneDebtEntry);
    setList(debts);
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  return (
    <AppContainer emptyList={listLen === 0}>
      <DebtList />
    </AppContainer>
  );
};

export default Component;
