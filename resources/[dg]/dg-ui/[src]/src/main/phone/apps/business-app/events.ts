import { genericAction, getState } from '../../lib';

export const events: Phone.Events = {};

events.setBusinessPermissionLabels = (labels: Record<string, string>) => {
  const businessState = getState<Phone.Business.State>('phone.apps.business');
  genericAction('phone.apps.business', {
    ...businessState,
    permissionLabels: labels,
  });
};
