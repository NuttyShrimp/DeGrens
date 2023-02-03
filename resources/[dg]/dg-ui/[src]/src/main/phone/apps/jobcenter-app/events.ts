import { updateNotification } from '../../lib';

import { useJobcenterAppStore } from './stores/useJobcenterAppStore';

export const events: Phone.Events = {};

events.groupIsFull = () => {
  updateNotification('phone-jobs-groups-join', {
    description: 'De groep is vol!',
    sticky: false,
  });
};

events.updateStore = (
  data: Partial<
    Omit<Phone.JobCenter.State, 'jobs' | 'groups' | 'currentGroup'> & {
      currentGroup: Omit<Phone.JobCenter.Group, 'idle'> | 'null';
    }
  >
) => {
  // filter undefined from data and parse string null to actual null
  const newState = Object.entries(data).reduce<Partial<Omit<Phone.JobCenter.State, 'jobs' | 'groups'>>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        const parsedValue = value === 'null' ? null : value;
        acc[key] = parsedValue;
      }
      return acc;
    },
    {}
  );

  useJobcenterAppStore.setState(newState);
};
