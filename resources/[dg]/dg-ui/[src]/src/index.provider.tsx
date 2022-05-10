import React from 'react';
import * as Sentry from '@sentry/react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Snackbar } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';

import { nuiAction } from './lib/nui-comms';
import { GetInitialState, type } from './lib/redux';
import { theme } from './base.styles';

export const IndexProvider = ({ children }) => {
  const mainState = useSelector<RootState, State.Main.State>(state => state.main);
  const dispatch = useDispatch();

  const handleClose = () => {
    nuiAction('reload');
    dispatch({
      type,
      cb: () => GetInitialState(),
    });
  };

  return (
    <Sentry.ErrorBoundary fallback={<div>An error happenend in the root of UI, Restart the ui</div>} showDialog>
          <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                  <CssBaseline />
                  {mainState.mounted ? (
                      children
                  ) : (
                      <Snackbar
                          open={true}
                          autoHideDuration={3000}
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                          onClose={handleClose}
                      >
                          <Alert
                              onClose={handleClose}
                              variant='filled'
                              severity={mainState.error ? 'error' : 'info'}
                              sx={{ width: '100%' }}
                          >
                              {mainState.error ? `An error occurred in ${mainState.error}.` : ''} Reloading the UI...
                          </Alert>
                      </Snackbar>
                  )}
              </ThemeProvider>
          </StyledEngineProvider>
    </Sentry.ErrorBoundary>
  );
};
