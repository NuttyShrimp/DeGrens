import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  wrapper: {
    width: '100%',
    height: '100%',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '0 1vh',
    position: 'relative',
    '& > div:first-child': {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  },
  actionWrapper: {
    color: 'white',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'flex-end',
    position: 'fixed',
  },
  innerActionWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  action: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2vh',
    marginLeft: '.5vh',
    cursor: 'pointer',
  },
  backAction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1vh',
  },
  inputsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerInputWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  container: {
    height: '100%',
    overflow: 'auto',
    overflowX: 'hidden',
    position: 'relative',
  },
});
