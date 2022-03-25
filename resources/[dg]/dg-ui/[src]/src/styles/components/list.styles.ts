import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  entry: {
    display: 'flex',
    alignItems: 'center',
    borderBottom: `.1vh solid #e0e0e0`,
    '& .icon': {
      width: '1.5rem',
      height: '1.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    '& .text': {
      marginLeft: '.5rem',
      fontSize: '1rem',
    },
  },
});
