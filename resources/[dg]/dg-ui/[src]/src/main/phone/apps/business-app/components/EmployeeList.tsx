import React, { FC, useEffect, useState } from 'react';
import { Paper } from '@src/components/paper';
import { ConfirmationModal } from '@src/components/util';
import { useUpdateState } from '@src/lib/redux';
import { hideFormModal, showFormModal, showLoadModal } from '@src/main/phone/lib';
import { AppContainer } from '@src/main/phone/os/appcontainer/appcontainer';

import { nuiAction } from '../../../../../lib/nui-comms';
import {
  addRole,
  changeBankPerms,
  chargeExtern,
  fireEmployee,
  hireEmployee,
  payEmployee,
  payExtern,
  removeRole,
  updateEmployee,
  updateRole,
} from '../lib';

import { BankAccessModal } from './modals/BankAccessModal';
import { RoleModal } from './modals/RoleModal';
import { RolePermsModal } from './modals/RolePermsModal';
import { UserPayModal } from './modals/UserPayModal';
import { UserModal } from './modals/UserRoleModal';

export const EmployeeList: FC<{ list: Phone.Business.Employee[]; permissions: string[]; id: number }> = props => {
  const updateState = useUpdateState('phone.apps.business');
  const [employees, setEmployees] = useState(props.list);

  useEffect(() => {
    setEmployees(props.list);
  }, [props.list]);

  const getPaperActions = (employee: Phone.Business.Employee) => {
    const actions: Action[] = [];
    if (props.permissions.includes('hire')) {
      actions.push({
        icon: 'user-tag',
        title: 'Verander rol',
        onClick: () => {
          showFormModal(
            <UserModal
              citizenid={employee.citizenid}
              role={employee.role}
              onSubmit={(...args) => updateEmployee(props.id, ...args)}
            />
          );
        },
      });
    }
    if (props.permissions.includes('fire')) {
      actions.push({
        icon: 'user-slash',
        title: 'Ontsla',
        onClick: () => {
          showFormModal(
            <ConfirmationModal
              header={`Weet je zeker dat je ${employee.name} wilt ontslaan?`}
              onAccept={() => fireEmployee(props.id, employee.citizenid)}
            />
          );
        },
      });
    }
    if (props.permissions.includes('change_bank_perms')) {
      actions.push({
        icon: 'building-columns',
        title: 'Bank Toegang Bewerken',
        onClick: () => {
          showFormModal(
            <BankAccessModal
              permissions={employee.bank}
              onSubmit={perms => changeBankPerms(props.id, employee.citizenid, perms)}
            />
          );
        },
      });
    }
    if (props.permissions.includes('pay_employee')) {
      actions.push({
        icon: 'hand-holding-dollar',
        title: 'Betaal',
        onClick: () => {
          showFormModal(
            <UserPayModal citizenid={employee.citizenid} onSubmit={(...args) => payEmployee(props.id, ...args)} />
          );
        },
      });
    }
    return actions;
  };

  const getActions = () => {
    const actions: Action[] = [];
    if (props.permissions.includes('hire')) {
      actions.push({
        icon: 'user-plus',
        title: 'Aannemen',
        onClick: () => {
          showFormModal(<UserModal onSubmit={(...args) => hireEmployee(props.id, ...args)} />);
        },
      });
    }
    if (props.permissions.includes('pay_external')) {
      actions.push({
        icon: 'hand-holding-dollar',
        title: 'Betaal Extern',
        onClick: () => {
          showFormModal(<UserPayModal onSubmit={(...args) => payExtern(props.id, ...args)} />);
        },
      });
    }
    if (props.permissions.includes('charge_external')) {
      actions.push({
        icon: 'credit-card',
        title: 'Extern aanrekenen',
        onClick: () => {
          showFormModal(<UserPayModal onSubmit={(...args) => chargeExtern(props.id, ...args)} />);
        },
      });
    }
    if (props.permissions.includes('change_role')) {
      actions.push(
        {
          title: 'Rol toevoegen',
          icon: 'user-tag',
          onClick: () => showFormModal(<RolePermsModal onSubmit={(...args) => addRole(props.id, ...args)} />),
        },
        {
          title: 'Rol bewerken',
          icon: 'user-tag',
          onClick: () => showFormModal(<RolePermsModal name onSubmit={(...args) => updateRole(props.id, ...args)} />),
        },
        {
          title: 'Rol verwijderen',
          icon: 'user-tag',
          onClick: () => showFormModal(<RoleModal onSubmit={(...args) => removeRole(props.id, ...args)} />),
        }
      );
    }
    if (props.permissions.includes('logs')) {
      actions.push({
        icon: 'book-user',
        title: 'Logboek openen',
        onClick: async () => {
          showLoadModal();
          const logs = await nuiAction<Phone.Business.Log[]>('phone/business/getLogs', {
            offset: 0,
            id: props.id,
          });
          hideFormModal();
          updateState({
            activeApp: 'log',
            logs,
          });
        },
      });
    }
    return actions;
  };

  return (
    <AppContainer
      emptyList={Object.keys(props.list).length === 0}
      onClickBack={() =>
        updateState({
          currentBusiness: null,
          activeApp: 'business',
          employees: [],
          roles: {},
        })
      }
      search={{
        list: props.list,
        filter: ['citizenid', 'name'],
        onChange: setEmployees,
      }}
      auxActions={getActions()}
    >
      <div>
        {employees.map(employee => (
          <Paper
            key={employee.name}
            title={employee.name}
            description={employee.role}
            image={employee.isOwner ? 'user-tie-hair' : 'user'}
            actions={getPaperActions(employee)}
          />
        ))}
      </div>
    </AppContainer>
  );
};
