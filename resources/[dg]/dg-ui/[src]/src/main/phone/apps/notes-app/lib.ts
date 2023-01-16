import { nuiAction } from '../../../../lib/nui-comms';

import { useNotesAppStore } from './stores/useNotesAppStore';

export const setCurrentNote = (note: Phone.Notes.Note | null) => {
  useNotesAppStore.setState({
    current: note,
  });
};

export const addNewNote = async () => {
  const newNote = await nuiAction('phone/notes/new', {
    title: 'New Note',
    note: '',
    date: Date.now(),
  });
  const appState = useNotesAppStore.getState();
  appState.list.unshift(newNote);
  appState.current = newNote;
  useNotesAppStore.setState(appState);
};

export const removeCurrentNote = () => {
  const appState = useNotesAppStore.getState();
  if (!appState.current) return;
  appState.list = appState.list.filter(n => n.id !== appState.current?.id);
  appState.current = null;
  useNotesAppStore.setState(appState);
};

export const updateNote = (id: number, title: string, text: string) => {
  const appState = useNotesAppStore.getState();
  const note = appState.list.find(n => n.id === id);
  if (!note) return;
  note.title = title;
  note.note = text;
  note.date = Date.now();
  useNotesAppStore.setState(appState);
  nuiAction('phone/notes/save', {
    id: note.id,
    note: text,
    title: title,
  });
};
