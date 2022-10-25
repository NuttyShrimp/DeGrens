import React, { FC, useMemo } from 'react';

import { gtaColors } from '../../data/gtacolors';

import { AbstractColorPicker } from './AbstractColorPicker';

import '../../styles/colorPicker.scss';

export const GTAColorPicker: FC<Bennys.ColorSelector.Props> = props => {
  const options = useMemo((): RGB[] => {
    return gtaColors.map(c => c.color);
  }, []);
  return <AbstractColorPicker {...props} options={options} rows={7} type={'gta'} />;
};
