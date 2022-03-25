import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '.2vh 1.5vh',
    fontSize: '.8rem',
    userSelect: 'none',
    '& > div': {
      display: 'flex',
      flexDirection: 'row',
    },
  },
  left: {
    '& > *:not(:first-child)': {
      marginLeft: '.3vh',
    },
  },
  right: {
    '& > *:not(:last-child)': {
      marginRight: '.3vh',
    },
  },
});
