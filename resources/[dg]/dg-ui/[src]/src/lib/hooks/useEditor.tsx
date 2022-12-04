import PlaceHolder from '@tiptap/extension-placeholder';
import { Editor, useEditor as useTTEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const useEditor = (props: Editor.Props): Editor | null => {
  return useTTEditor({
    extensions: [
      StarterKit,
      PlaceHolder.configure({
        placeholder: props.placeholder,
      }),
    ],
    content: props.defaultValue,
    editable: !props?.readonly ?? true,
  });
};
