import { updateNotification } from '../../lib';

import { useJobcenterAppStore } from './stores/useJobcenterAppStore';

export const events: Phone.Events = {};

events.groupIsFull = () => {
  updateNotification('phone-jobs-groups-join', {
    description: 'De groep is vol!',
    sticky: false,
  });
};

events.setCurrentGroup = (data: Phone.JobCenter.Group | null) => {
  useJobcenterAppStore.setState({
    currentGroup: data,
  });
};

events.setMembers = (data: Phone.JobCenter.Member[] | undefined) => {
  useJobcenterAppStore.setState({
    groupMembers: data,
  });
};

events.setOwner = (data: boolean) => {
  useJobcenterAppStore.setState({
    isOwner: data,
  });
};
