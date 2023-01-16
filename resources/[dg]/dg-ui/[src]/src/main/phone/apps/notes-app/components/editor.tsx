import React, { FC, useState } from 'react';
import { useCallback } from 'react';
import { useEditor } from '@src/lib/hooks/useEditor';
import { EditorContent } from '@tiptap/react';

import { nuiAction } from '../../../../../lib/nui-comms';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { removeCurrentNote, setCurrentNote, updateNote } from '../lib';
import { useNotesAppStore } from '../stores/useNotesAppStore';

import '../styles/editor.scss';
export const Document: FC<{}> = () => {
  const note = useNotesAppStore(s => s.current!);
  const [title, setTitle] = useState(note.title ?? '');
  const [editMode, setEditMode] = useState(false);
  const editor = useEditor({
    placeholder: 'Schrijft iet...',
    defaultValue: note.note,
    readonly: true,
  });

  // region Actions
  const readActions: Action[] = [
    {
      title: 'Bewerk',
      icon: 'pencil',
      onClick: useCallback(() => {
        editor?.setEditable(true);
        setEditMode(true);
        nuiAction('phone/notes/enterEdit', { edit: true });
      }, [editor]),
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
      onClick: useCallback(() => {
        updateNote(note.id, title, editor?.getHTML() ?? '');
        editor?.setEditable(false);
        setEditMode(false);
        nuiAction('phone/notes/enterEdit', { edit: false });
      }, [editor, note.id, title]),
    },
  ];
  // endregion

  return (
    <AppContainer
      input={{
        value: title,
        onChange: setTitle,
        label: 'Titel',
        disabled: !editMode,
      }}
      primaryActions={note.readonly ? [] : editMode ? editActions : readActions}
      auxActions={!note.readonly && !editMode ? readAuxActions : undefined}
      onClickBack={() => setCurrentNote(null)}
    >
      <EditorContent editor={editor} className={'phone-editor'} />
    </AppContainer>
  );
};
