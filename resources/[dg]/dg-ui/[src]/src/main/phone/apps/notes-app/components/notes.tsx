import React, { FC } from 'react';

import { Document } from './editor';
import { List } from './list';

export const Notes: FC<React.PropsWithChildren<Phone.Notes.Props>> = props => {
  return props.current === null ? (
    <List list={props.list} updateState={props.updateState} />
  ) : (
    <Document note={props.current} />
  );
};
