import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { nuiAction } from './lib/nui-comms';
import { store, type } from './lib/redux';
import { theme } from './base.styles';

export const IndexProvider = ({ children }) => {
  const { error, mounted } = useSelector<RootState, State.Main.State>(state => state.main);

  const handleClose = () => {
    nuiAction('reload');
  };

  useEffect(() => {
    store.dispatch({
      type,
      cb: state => ({
        ...state,
        main: {
          ...state.main,
          mounted: error === null,
        },
      }),
    });
  }, [error]);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Snackbar open={error !== null} autoHideDuration={5000} onClose={handleClose}>
          <Alert onClose={handleClose} severity='error' sx={{ width: '100%' }}>
            An error occurred in ${error}. Reloading the UI...
          </Alert>
        </Snackbar>
        {mounted && children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};
