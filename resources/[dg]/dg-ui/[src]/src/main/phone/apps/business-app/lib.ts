import { nuiAction } from '@src/lib/nui-comms';

import { genericAction, getState, showCheckmarkModal, showLoadModal, showWarningModal } from '../../lib';

export const updateEmployee = async (id: number, cid: number, role: string) => {
  const success = await nuiAction('phone/business/updateEmployee', { cid, role, id });
  if (!success) {
    showWarningModal();
    return false;
  }
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  genericAction('phone.apps.business', {
    ...businessState,
    employees: businessState.employees.map(e => {
      if (e.citizenid === cid) {
        e.role = role;
      }
      return e;
    }),
  });
  showCheckmarkModal();
};

export const hireEmployee = async (id: number, cid: number, role: string) => {
  const employeeName = await nuiAction<string>('phone/business/hireEmployee', { id, cid, role }, 'NUB');
  if (!employeeName) {
    showWarningModal();
    return false;
  }
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  genericAction('phone.apps.business', {
    ...businessState,
    employees: [
      ...businessState.employees,
      {
        role,
        citizenid: cid,
        isOwner: false,
        name: employeeName,
      },
    ],
  });
  showCheckmarkModal();
};

export const fireEmployee = async (id: number, cid: number) => {
  showLoadModal();
  const success = await nuiAction('phone/business/fireEmployee', { cid, id });
  if (!success) {
    showWarningModal();
    return false;
  }
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  genericAction('phone.apps.business', {
    ...businessState,
    employees: businessState.employees.filter(e => e.citizenid !== cid),
  });
  showCheckmarkModal();
};

export const payEmployee = async (id: number, cid: number, price: number, comment: string) => {
  const success = await nuiAction('phone/business/payEmployee', { cid, price, comment, id });
  success ? showCheckmarkModal() : showWarningModal();
};

export const payExtern = async (id: number, cid: number, price: number, comment: string) => {
  const success = await nuiAction('phone/business/payExtern', { id, cid, price, comment });
  success ? showCheckmarkModal() : showWarningModal();
};

export const chargeExtern = async (id: number, cid: number, price: number, comment: string) => {
  const success = await nuiAction('phone/business/chargeExtern', { id, cid, price, comment });
  success ? showCheckmarkModal() : showWarningModal();
};

export const addRole = async (id: number, role: string, permissions: Record<string, boolean>) => {
  const chosenPerms = Object.keys(permissions).filter(p => permissions[p]);
  const success = await nuiAction('phone/business/addRole', { id, role, permissions: chosenPerms });
  if (!success) {
    showWarningModal();
  }
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  businessState.roles[role] = chosenPerms;
  genericAction('phone.apps.business', {
    ...businessState,
  });
  showCheckmarkModal();
};

export const updateRole = async (id: number, role: string, permissions: Record<string, boolean>) => {
  const newPerms = await nuiAction('phone/business/updateRole', { id, role, permissions });
  if (!newPerms) {
    showWarningModal();
    return;
  }
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  businessState.roles[role] = newPerms;
  genericAction('phone.apps.business', {
    ...businessState,
  });
  showCheckmarkModal();
};

export const removeRole = async (id: number, role: string) => {
  const success = await nuiAction('phone/business/removeRole', { id, role });
  if (!success) {
    showWarningModal();
  }
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  delete businessState.roles[role];
  genericAction('phone.apps.business', {
    ...businessState,
  });
};

export const changeBankPerms = async (id: number, cid: number, perms: Financials.AccountPermission) => {
  const success = await nuiAction('phone/business/updateBank', { id, cid, perms });
  if (!success) {
    showWarningModal();
    return;
  }
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  const employee = businessState.employees.find(e => e.citizenid === cid);
  if (!employee) {
    showWarningModal();
    return;
  }
  employee.bank = perms;
  genericAction('phone.apps.business', {
    ...businessState,
  });
  showCheckmarkModal();
};
