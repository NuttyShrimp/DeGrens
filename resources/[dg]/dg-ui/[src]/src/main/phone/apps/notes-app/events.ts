import { nuiAction } from '../../../../lib/nui-comms';
import { addNotification, changeApp } from '../../lib';

import { setCurrentNote } from './lib';

export const events: Phone.Events = {};

events.share = (data: { note: Phone.Notes.Note; id: number }) => {
  addNotification({
    id: `note-${data.id}`,
    icon: 'notes',
    title: 'View Note',
    description: `a note is being shared`,
    onAccept: async (notiData: { id: number; note: Phone.Notes.Note }) => {
      const noteId = await nuiAction('phone/notes/resolveShare', {
        id: notiData.id,
        accepted: true,
      });
      if (typeof noteId === 'number') {
        notiData.note.id = noteId;
      }
      setCurrentNote(notiData.note);
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
      note: data.note,
    },
  });
};
