import React, { FC } from 'react';

import { Paper } from '../../../../../components/paper';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { addNewNote, setCurrentNote } from '../lib';

import { styles } from './notes.styles';

export const List: FC<
  React.PropsWithChildren<
    State.BaseProps & {
      list: Phone.Notes.Note[];
    }
  >
> = props => {
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
      emptyList={props.list.length === 0}
    >
      <div className={classes.list}>
        {props.list.map(note => (
          <Paper title={note.title} key={note.id} onClick={() => setCurrentNote(note)} />
        ))}
      </div>
    </AppContainer>
  );
};
