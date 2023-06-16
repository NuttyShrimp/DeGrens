import { useEditor } from '@src/lib/hooks/useEditor';
import { EditorContent } from '@tiptap/react';

export const ReportMessage = ({ message }: { message: Panel.Message }) => {
  const editor = useEditor({
    readonly: true,
    defaultValue: JSON.parse(message.message),
    placeholder: 'Report message',
  });
  return (
    <div className='reports-message'>
      <div className='reports-message-sender'>{message.sender.username}</div>
      <EditorContent editor={editor} />
    </div>
  );
};
