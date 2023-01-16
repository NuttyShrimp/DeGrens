import React, { FC } from 'react';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { TITLE_OF_TYPE } from '../constants';
import { getInventoryType } from '../util';

import { Grid } from './grid';

export const PrimarySide: FC<Inventory.PrimarySide & { items: string[]; cellSize: number }> = props => {
  const cash = useMainStore(s => s.character.cash);

  return (
    <div className='side' style={{ width: props.cellSize * 9 }}>
      <div className='title text'>{`${TITLE_OF_TYPE['player']} - €${cash}`}</div>
      {props.id && <Grid id={props.id} size={props.size} items={props.items} cellSize={props.cellSize} />}
    </div>
  );
};

export const SecondarySide: FC<Inventory.SecondarySide & { items: string[]; cellSize: number }> = props => {
  return (
    <div className='side' style={{ width: props.cellSize * 9 }}>
      <div className='title text'>{TITLE_OF_TYPE[props.id ? getInventoryType(props.id) : 'loading']}</div>
      {props.id && <Grid id={props.id} size={props.size} items={props.items} cellSize={props.cellSize} />}
    </div>
  );
};
