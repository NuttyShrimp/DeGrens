import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    justifyContent: 'center',
  },
  dialerRoot: {
    display: 'flex',
    flexDirection: 'column',
    width: '65%',
    height: '75%',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto',
  },
  dialerBtns: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginTop: '1vh',
  },
  dialerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: '1vh',
  },
});
