import { FC, useEffect } from 'react';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import { BusinessList } from './components/BusinessList';
import { EmployeeList } from './components/EmployeeList';
import { LogList } from './components/LogList';
import { useBusinessAppStore } from './stores/useBusinessAppStore';

const Component: FC<{}> = () => {
  const [list, activeApp, currentBusiness, updateStore] = useBusinessAppStore(s => [
    s.list,
    s.activeApp,
    s.currentBusiness,
    s.updateStore,
  ]);
  const fetchBusinesses = async () => {
    const businesses = await nuiAction('phone/business/get', {}, devData.phoneBusinesses);
    updateStore({
      list: businesses,
    });
  };

  const fetchBusinessInfo = async () => {
    let employees: Phone.Business.Employee[] = [];
    let roles: Record<string, string[]> = {};
    if (currentBusiness) {
      employees = await nuiAction(
        'phone/business/employees',
        {
          id: currentBusiness,
        },
        devData.phoneBusinessEmployees
      );
      roles = await nuiAction(
        'phone/business/roles',
        {
          id: currentBusiness,
        },
        devData.phoneBusinessRoles
      );
    }
    updateStore({
      employees,
      roles,
    });
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    fetchBusinessInfo();
  }, [currentBusiness]);

  if (activeApp === 'employee' && currentBusiness) {
    return (
      <EmployeeList permissions={list.find(b => b.id === currentBusiness)?.permissions ?? []} id={currentBusiness} />
    );
  }
  if (activeApp === 'log') {
    return <LogList />;
  }

  return <BusinessList list={list} />;
};

export default Component;
