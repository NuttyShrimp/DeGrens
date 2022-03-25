import React, { FC, useState } from 'react';
import Editor from '@components/editor';

import { nuiAction } from '../../../../../lib/nui-comms';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { removeCurrentNote, setCurrentNote, updateNote } from '../lib';

export const Document: FC<{ note: Phone.Notes.Note }> = ({ note }) => {
  const [title, setTitle] = useState(note.title ?? '');
  const [noteText, setNoteText] = useState(note.note ?? '');
  const [inEditMode, setEditMode] = useState(false);

  // region Actions
  const readActions: Action[] = [
    {
      title: 'Bewerk',
      icon: 'pencil',
      onClick: () => setEditMode(true),
    },
  ];
  const readAuxActions: Action[] = [
    {
      title: 'Share (Local)',
      icon: 'share-alt',
      onClick: () => {
        nuiAction('phone/notes/share', {
          type: 'local',
          id: note.id,
          duration: 0,
        });
      },
    },
    {
      title: 'Share (Permanent)',
      icon: 'share',
      onClick: () => {
        nuiAction('phone/notes/share', {
          type: 'permanent',
          id: note.id,
          duration: 0,
        });
      },
    },
    {
      title: 'Delete',
      icon: 'trash',
      onClick: () => {
        nuiAction('phone/notes/delete', {
          id: note.id,
        });
        removeCurrentNote();
      },
    },
  ];

  const editActions: Action[] = [
    {
      title: 'Save',
      icon: 'save',
      onClick: () => {
        updateNote(note.id, title, noteText);
        setEditMode(false);
      },
    },
  ];
  // endregion

  return (
    <AppContainer
      input={{
        value: title,
        onChange: setTitle,
        label: 'Titel',
      }}
      primaryActions={note.readonly ? [] : inEditMode ? editActions : readActions}
      auxActions={!note.readonly && !inEditMode ? readAuxActions : undefined}
      onClickBack={() => setCurrentNote(null)}
    >
      <Editor
        onChange={setNoteText}
        placeholder={'Plaats hier je text'}
        defaultValue={noteText}
        readonly={!inEditMode}
      />
    </AppContainer>
  );
};
