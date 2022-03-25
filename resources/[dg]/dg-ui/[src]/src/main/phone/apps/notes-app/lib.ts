import { nuiAction } from '../../../../lib/nui-comms';
import { genericAction, getState } from '../../lib';

export const setCurrentNote = (note: Phone.Notes.Note | null) => {
  genericAction('phone.apps.notes', {
    current: note,
  });
};

export const addNewNote = async () => {
  const newNote = await nuiAction('phone/notes/new', {
    title: 'New Note',
    note: '',
    date: Date.now(),
  });
  const appState = getState<Phone.Notes.State>('phone.apps.notes');
  appState.list.unshift(newNote);
  appState.current = newNote;
  genericAction('phone.apps.notes', appState);
};

export const removeCurrentNote = () => {
  const appState = getState<Phone.Notes.State>('phone.apps.notes');
  if (!appState.current) return;
  appState.list = appState.list.filter(n => n.id !== appState.current?.id);
  appState.current = null;
  genericAction('phone.apps.notes', appState);
};

export const updateNote = (id: number, title: string, text: string) => {
  const appState = getState<Phone.Notes.State>('phone.apps.notes');
  const note = appState.list.find(n => n.id === id);
  if (!note) return;
  note.title = title;
  note.note = text;
  note.date = Date.now();
  genericAction('phone.apps.notes', appState);
  nuiAction('phone/notes/save', {
    id: note.id,
    note: text,
    title: title,
  });
};
