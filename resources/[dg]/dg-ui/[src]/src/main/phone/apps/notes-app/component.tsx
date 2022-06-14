import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';

import { Document } from './components/editor';
import { List } from './components/list';

const Component: AppFunction<Phone.Notes.State> = props => {
  const fetchNotes = async () => {
    const _notes = await nuiAction<Phone.Notes.Note[]>('phone/notes/get', {}, devData.notes);
    const sortedNotes = _notes.sort((n1, n2) => n1.date - n2.date);
    props.updateState({
      list: sortedNotes,
    });
  };

  useEffect(() => {
    fetchNotes();
  }, []);
  return props.current === null ? (
    <List list={props.list} updateState={props.updateState} />
  ) : (
    <Document note={props.current} />
  );
};

export default Component;
