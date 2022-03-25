import makeStyles from '@mui/styles/makeStyles';

export const styles = makeStyles({
  root: {
    width: '55%',
    height: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': {
      marginTop: '2vh',
    },
  },
});
