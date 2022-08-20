import React, { FC } from 'react';

import { TITLE_OF_TYPE } from '../constants';

import { Grid } from './grid';

export const PrimarySide: FC<Inventory.PrimarySide & { items: string[]; cellSize: number }> = props => {
  return (
    <div className='side' style={{ width: props.cellSize * 9 }}>
      <div className='title text'>{TITLE_OF_TYPE['player'] + ` - €${props.cash}`}</div>
      <Grid id={props.id} size={props.size} items={props.items} cellSize={props.cellSize} />
    </div>
  );
};

export const SecondarySide: FC<Inventory.SecondarySide & { items: string[]; cellSize: number }> = props => {
  return (
    <div className='side' style={{ width: props.cellSize * 9 }}>
      <div className='title text'>{TITLE_OF_TYPE[props?.id?.split('_')[0] ?? 'loading']}</div>
      <Grid id={props.id} size={props.size} items={props.items} cellSize={props.cellSize} />
    </div>
  );
};
