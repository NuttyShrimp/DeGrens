import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > span': {
      width: '100%',
    },
  },
  imageList: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
});
