import React, { FC } from 'react';
import { ComponentItem, FloatingToolbar, ToolbarItemUnion } from '@remirror/react';

const basicFormatting = ['toggleBold', 'toggleItalic', 'toggleUnderline', 'toggleStrike', 'toggleBlockquote'];

const actionBarItems: ToolbarItemUnion[] = [
  {
    type: ComponentItem.ToolbarGroup,
    label: 'Basic bitch formatting',
    items: basicFormatting.map(a => ({
      type: ComponentItem.ToolbarCommandButton,
      commandName: a,
      display: 'icon',
    })),
  },
];

export const FloatingActionBar: FC<React.PropsWithChildren<{ readonly: boolean }>> = ({ readonly }) => (
  <FloatingToolbar
    items={actionBarItems}
    positioner='selection'
    renderOutsideEditor
    enabled={!readonly}
    placement='top'
  />
);
