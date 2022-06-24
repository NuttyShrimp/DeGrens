import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: '.75vh',
    '& > *': {
      flex: '1 0 22%',
    },
  },
  app: {
    minWidth: '5.3vh',
    maxWidth: '5.3vh',
    minHeight: '5.3vh',
    maxHeight: '5.3vh',
    marginBottom: '.75vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '1vh',
    boxShadow: '3px 3px 4px 0vh rgba(0, 0, 0, 0.2)',
  },
});
