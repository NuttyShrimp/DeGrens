import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#8d96ec',
        },
        secondary: {
            main: '#E6B341',
        },
        info: {
            main: '#E85476',
        },
        background: {
            default: 'transparent',
        },
    },
});
export default theme;
