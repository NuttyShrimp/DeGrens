import React, { FC, useCallback } from 'react';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { PlaceholderExtension } from 'remirror/extensions';

import { ExtendedOptions } from './editors/ExtendedOptions';
import { FloatingActionBar } from './editors/FloatingActionBar';
import { getExtensions } from './extensions';

import '@remirror/styles/all.css';
import '../../styles/components/editor.scss';

const Editor: FC<React.PropsWithChildren<Editor.Props>> = props => {
  const extensions = useCallback(
    () => [new PlaceholderExtension({ placeholder: props.placeholder }), ...getExtensions()],
    [props.placeholder]
  );

  const { manager, state, setState } = useRemirror({ extensions, stringHandler: 'text', content: props.defaultValue });
  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        state={state}
        onChange={parameter => {
          props.onChange(parameter.helpers.getHTML());
          setState(parameter.state);
        }}
        editable={!props.readonly ?? true}
      >
        <EditorComponent />
        <ExtendedOptions readonly={props.readonly ?? false} />
        <FloatingActionBar readonly={props.readonly ?? false} />
        {/*<FloatingLinkToolbar />*/}
      </Remirror>
    </ThemeProvider>
  );
};

export default Editor;
