import { useCallback, useState } from 'react';
import AppWrapper from '@components/appwrapper';
import { Button } from '@src/components/button';
import { useEditor } from '@src/lib/hooks/useEditor';
import { nuiAction } from '@src/lib/nui-comms';
import { EditorContent } from '@tiptap/react';

import config from './_config';

import './styles/notes.scss';

const Component: AppFunction = props => {
  const [id, setId] = useState(0);
  const editor = useEditor({
    placeholder: 'Schrijft iet...',
  });

  const onShow = useCallback(
    (data: { note?: string; id?: number }) => {
      if (editor) {
        editor.commands.setContent(data?.note ?? '<p></p>');
      }
      if (data.id) {
        setId(data.id);
      }
      props.showApp();
    },
    [editor, props.showApp]
  );

  const onHide = useCallback(() => {
    props.hideApp();
    setId(0);
    if (editor) {
      editor.commands.setContent('<p></p>');
    }
  }, [editor, props.hideApp]);

  const handleSave = () => {
    if (editor?.isEmpty) {
      doClose();
      return;
    }
    nuiAction('notes/save', { note: editor?.getHTML() ?? '', id });
  };

  const doClose = () => {
    nuiAction('main/close', { app: 'notes' });
  };

  return (
    <AppWrapper appName={config.name} onShow={onShow} onHide={onHide} onEscape={doClose} full>
      <div className='notepad-container' onClick={() => editor?.commands.focus()}>
        <div className='notepad-pad'>
          <EditorContent editor={editor} />
        </div>
        <div className='notepad-actions'>
          <Button.Secondary onClick={doClose}>Close</Button.Secondary>
          <Button.Primary onClick={handleSave}>Save</Button.Primary>
        </div>
      </div>
    </AppWrapper>
  );
};

export default Component;
