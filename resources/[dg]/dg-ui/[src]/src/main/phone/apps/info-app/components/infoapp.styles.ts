import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '5vh',
  },
  entry: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '.5vh',
    '& > .info-icon': {
      textAlign: 'center',
      minWidth: '5.3vh',
      marginRight: '.2vh',
      fontSize: '2.5rem',
    },
    '& > p': {
      fontSize: '1.2rem',
      fontWeight: 'bold',
    },
  },
});
