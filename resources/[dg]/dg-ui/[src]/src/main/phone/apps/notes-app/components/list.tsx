import React, { FC } from 'react';

import { Paper } from '../../../../../components/paper';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { addNewNote, setCurrentNote } from '../lib';
import { useNotesAppStore } from '../stores/useNotesAppStore';

import { styles } from './notes.styles';

export const List: FC<{}> = () => {
  const list = useNotesAppStore(s => s.list);
  const classes = styles();

  return (
    <AppContainer
      primaryActions={[
        {
          icon: 'plus',
          title: 'Nieuw',
          onClick() {
            addNewNote();
          },
        },
      ]}
      emptyList={list.length === 0}
    >
      <div className={classes.list}>
        {list.map(note => (
          <Paper title={note.title} key={note.id} onClick={() => setCurrentNote(note)} />
        ))}
      </div>
    </AppContainer>
  );
};
