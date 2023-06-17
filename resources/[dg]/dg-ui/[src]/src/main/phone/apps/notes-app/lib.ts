import { nuiAction } from '../../../../lib/nui-comms';

import { useNotesAppStore } from './stores/useNotesAppStore';

export const setCurrentNote = (note: Phone.Notes.Note | null) => {
  useNotesAppStore.setState({
    current: note,
  });
};

export const addNewNote = async () => {
  const newNote = await nuiAction('phone/notes/new');
  useNotesAppStore.setState(s => ({
    list: [newNote, ...s.list],
    current: newNote,
  }));
};

export const removeCurrentNote = () => {
  useNotesAppStore.setState(s => ({
    list: s.list.filter(n => n.id !== s.current?.id),
    current: null,
  }));
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
