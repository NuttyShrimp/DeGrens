import React, { useEffect } from 'react';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';

import { BusinessList } from './components/BusinessList';
import { EmployeeList } from './components/EmployeeList';
import { LogList } from './components/LogList';

const Component: AppFunction<Phone.Business.State> = props => {
  const fetchBusinesses = async () => {
    const businesses = await nuiAction('phone/business/get', {}, devData.phoneBusinesses);
    props.updateState({
      list: businesses,
    });
  };

  const fetchBusinessInfo = async () => {
    let employees: Phone.Business.Employee[] = [];
    let roles: Record<string, string[]> = {};
    if (props.currentBusiness) {
      employees = await nuiAction(
        'phone/business/employees',
        {
          id: props.currentBusiness,
        },
        devData.phoneBusinessEmployees
      );
      roles = await nuiAction(
        'phone/business/roles',
        {
          id: props.currentBusiness,
        },
        devData.phoneBusinessRoles
      );
    }
    props.updateState({
      employees,
      roles,
    });
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    fetchBusinessInfo();
  }, [props.currentBusiness]);

  if (props.activeApp === 'employee' && props.currentBusiness) {
    return (
      <EmployeeList
        list={props.employees}
        permissions={props.list.find(b => b.id === props.currentBusiness)?.permissions ?? []}
        id={props.currentBusiness}
      />
    );
  }
  if (props.activeApp === 'log') {
    return <LogList />;
  }

  return <BusinessList list={props.list} />;
};

export default Component;
