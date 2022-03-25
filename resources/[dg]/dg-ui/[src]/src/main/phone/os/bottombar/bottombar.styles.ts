import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  root: {
    height: '2.5vh',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    fontSize: '.8rem',
    userSelect: 'none',
    '& > *': {
      cursor: 'pointer',
      textAlign: 'center',
      width: '2vh',
    },
  },
});
