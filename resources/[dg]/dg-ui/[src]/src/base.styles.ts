import { createTheme } from '@mui/material';

import { isDevel } from './lib/env';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8d96ec',
    },
    secondary: {
      main: '#E6B341',
    },
    background: {
      default: isDevel() ? '#121212' : 'transparent',
      paper: isDevel() ? '#121212' : 'transparent',
    },
  },
  typography: {
    body2: {
      fontSize: '0.75rem',
    },
  },
  components: {
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.7rem',
        },
      },
    },
  },
});

export const baseStyle = {
  primary: {
    darker: '#232832',
    dark: '#3d4482',
    normal: '#767fcf',
    light: '#abb3ff',
    lighter: '#bbbed7',
  },
  primaryDarker: {
    darker: '#1b1e23',
    dark: '#404654',
    normal: '#646f84',
    light: '#8796b3',
    lighter: '#abbee2',
  },
  secondary: {
    darker: '#664F1D',
    dark: '#A6802E',
    normal: '#E6B341',
    light: '#FFCD61',
    lighter: '#EACB88',
  },
  tertiary: {
    darker: '#692635',
    dark: '#B5415C',
    normal: '#E85476',
    light: '#FF7595',
    lighter: '#EC9CAE',
  },
  gray: {
    darker: '#020006',
    dark: '#424046',
    normal: '#828086',
    light: '#c8c6ca',
    lighter: '#fefaff',
  },
};
