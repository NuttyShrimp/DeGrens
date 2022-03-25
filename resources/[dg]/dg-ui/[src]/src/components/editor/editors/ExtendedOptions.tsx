import React, { FC } from 'react';
import { ComponentItem, FloatingActionsMenu } from '@remirror/react';
import { MenuActionItemUnion } from '@remirror/react-components/dist/declarations/src/react-component-types';

const actions: MenuActionItemUnion[] = [
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 1 },
    tags: ['heading', '1', 'one'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 2 },
    tags: ['heading', '2', 'two'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleHeading',
    attrs: { level: 3 },
    tags: ['heading', '3', 'three'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleBulletList',
    tags: ['bullet', 'list'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleOrderedList',
    tags: ['ordered', 'list'],
  },
  {
    type: ComponentItem.MenuCommandAction,
    commandName: 'toggleTaskList',
    tags: ['task', 'list'],
  },
];

export const ExtendedOptions: FC<{ readonly: boolean }> = ({ readonly }) => {
  return <FloatingActionsMenu placement={'right'} enabled={!readonly} renderOutsideEditor actions={actions} />;
};
