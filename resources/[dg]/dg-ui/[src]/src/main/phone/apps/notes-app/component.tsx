import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';

import { Document } from './components/editor';
import { List } from './components/list';
import { useNotesAppStore } from './stores/useNotesAppStore';

const Component = () => {
  const [setList, current] = useNotesAppStore(s => [s.setList, s.current]);
  const fetchNotes = async () => {
    const _notes = await nuiAction<Phone.Notes.Note[]>('phone/notes/get', {}, devData.notes);
    const sortedNotes = _notes.sort((n1, n2) => n1.date - n2.date);

    setList(sortedNotes);
  };

  useEffect(() => {
    fetchNotes();
  }, []);
  return current === null ? <List /> : <Document />;
};

export default Component;
