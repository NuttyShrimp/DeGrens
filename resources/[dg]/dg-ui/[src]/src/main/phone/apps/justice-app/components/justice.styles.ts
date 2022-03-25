import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  root: {
    display: 'flex',
  },
  header: {
    fontSize: '1.2rem',
    fontWeight: 600,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
  },
  entry: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    '& > .phone': {
      justifySelf: 'end',
    },
  },
});
