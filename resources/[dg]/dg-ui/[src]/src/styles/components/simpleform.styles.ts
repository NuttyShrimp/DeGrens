import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  root: {
    width: '95%',
    '& > *': {
      height: '100%',
      margin: '.5vh 0',
    },
    '& > .simpleform-element': {
      width: '100%',
    },
  },
  header: {
    textAlign: 'center',
    width: '100%',
    fontWeight: 'bold',
    marginBottom: '1vh',
  },
  btnWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2vh',
  },
});
