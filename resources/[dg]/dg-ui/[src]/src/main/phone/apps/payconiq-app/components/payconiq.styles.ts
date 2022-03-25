import { green, orange } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  transTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    '& .green': {
      color: green[400],
    },
    '& .red': {
      color: orange[500],
    },
  },
});
