import { useEffect } from 'react';
import { Alert, Snackbar } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import * as Sentry from '@sentry/react';

import { EventHandlerProvider } from './components/context/eventHandlerCtx';
import { useApps } from './lib/hooks/useApps';
import { nuiAction } from './lib/nui-comms';
import { resetAllStores } from './lib/store';
import { useMainStore } from './lib/stores/useMainStore';
import { theme } from './base.styles';

export const IndexProvider = ({ children }) => {
  const { loadApps } = useApps();
  const [mounted, error] = useMainStore(s => [s.mounted, s.error]);

  const handleClose = () => {
    nuiAction('reload');
    resetAllStores();
    loadApps();
  };

  useEffect(() => {
    loadApps();
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<div>An error happenend in the root of UI, Restart the ui</div>} showDialog>
      <EventHandlerProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {mounted ? (
              children
            ) : (
              <Snackbar
                open={!mounted}
                autoHideDuration={3000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                onClose={handleClose}
              >
                <Alert
                  onClose={handleClose}
                  variant='filled'
                  severity={error ? 'error' : 'info'}
                  sx={{ width: '100%' }}
                >
                  {error ? `An error occurred in ${error}.` : ''} Reloading the UI...
                </Alert>
              </Snackbar>
            )}
          </ThemeProvider>
        </StyledEngineProvider>
      </EventHandlerProvider>
    </Sentry.ErrorBoundary>
  );
};
