import { genericAction, updateNotification } from '../../lib';

export const events: Phone.Events = {};

events.groupIsFull = () => {
  updateNotification('phone-jobs-groups-join', {
    description: 'De groep is vol!',
    sticky: false,
  });
};

events.setCurrentGroup = (data: Phone.JobCenter.Group | null) => {
  genericAction('phone.apps.jobcenter', {
    currentGroup: data,
  });
};

events.setMembers = (data: Phone.JobCenter.Member[] | null) => {
  genericAction('phone.apps.jobcenter', {
    groupMembers: data,
  });
};

events.setOwner = (data: boolean) => {
  genericAction('phone.apps.jobcenter', {
    isOwner: data,
  });
};
