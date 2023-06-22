import { useEffect } from 'react';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { DebtList } from './components/debtList';
import { useDebtAppStore } from './stores/useDebtAppStore';

const Component = () => {
  const [listLen, fetchDebts] = useDebtAppStore(s => [s.list.length, s.fetchDebts]);

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
