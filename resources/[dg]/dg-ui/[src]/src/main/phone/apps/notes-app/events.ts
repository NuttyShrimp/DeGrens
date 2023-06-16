import { nuiAction } from '../../../../lib/nui-comms';
import { addNotification, changeApp } from '../../lib';

import { setCurrentNote } from './lib';

export const events: Phone.Events = {};

events.share = (data: { id: number }) => {
  addNotification({
    id: `note-${data.id}`,
    icon: 'notes',
    title: 'View Note',
    description: `a note is being shared`,
    onAccept: async (notiData: { id: number }) => {
      const note = await nuiAction('phone/notes/resolveShare', {
        id: notiData.id,
        accepted: true,
      });
      if (!note) return;
      setCurrentNote(note);
      changeApp('notes');
    },
    onDecline: (notiData: { id: number }) => {
      nuiAction('phone/notes/resolveShare', {
        id: notiData.id,
        accepted: false,
      });
    },
    timer: 30,
    _data: {
      id: data.id,
    },
  });
};
