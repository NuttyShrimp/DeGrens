import { FC, useMemo } from 'react';
import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@mui/material/colors';

import { AbstractColorPicker } from './AbstractColorPicker';

import '../../styles/colorPicker.scss';

// Replace first and last realGrey with our own
const realGrey = {
  100: '#ffffff',
  200: grey[300],
  300: grey[400],
  400: grey[500],
  500: grey[600],
  600: grey[700],
  700: grey[800],
  800: grey[900],
  900: '#000000',
};

const colors = [
  realGrey,
  blueGrey,
  brown,
  red,
  deepOrange,
  orange,
  amber,
  yellow,
  lime,
  lightGreen,
  green,
  teal,
  cyan,
  lightBlue,
  blue,
  indigo,
  deepPurple,
  purple,
  pink,
];

// Ids of colors we want to use
const colorIdx = [100, 200, 300, 400, 500, 600, 700, 800, 900];

export const ColorPicker: FC<Bennys.ColorSelector.Props> = props => {
  // Array of all hex colorcodes
  const options = useMemo(() => {
    return colors.reduce<string[]>((acc, cur) => {
      return acc.concat(colorIdx.map(idx => cur[idx]));
    }, []);
  }, []);

  return <AbstractColorPicker {...props} options={options} rows={9} type={'custom'} />;
};
