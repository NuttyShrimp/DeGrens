import { genericAction, getState } from '../../lib';

export const events: Phone.Events = {};

events.registerInfoEntry = (data: { entry: Phone.Info.InfoAppEntry }) => {
  const infoState = getState<Phone.Info.Props>('phone.apps.info');
  genericAction('phone.apps.info', {
    entries: { ...infoState.entries, [data.entry.name]: data.entry },
  });
};
