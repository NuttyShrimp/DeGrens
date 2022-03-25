import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  hideSpan: {
    textDecoration: 'underline',
    cursor: 'pointer',
    textAlign: 'left',
  },
  wrapper: {
    border: '1px solid',
    height: '18vh',
    '& > div': {
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    '& img': {
      height: '100%',
      width: '100%',
      objectFit: 'contain',
    },
  },
  spinner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
  },
  hidden: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'inherit',
    cursor: 'pointer',
    '& > i': {
      fontSize: '2rem',
      marginBottom: '1vh',
    },
  },
});
