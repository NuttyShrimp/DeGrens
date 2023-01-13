import { makeStyles } from '@mui/styles';

export const styles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    bottom: '-60vh',
    right: 0,
  },
  shell: {
    height: '60vh',
    userSelect: 'none',
    pointerEvents: 'none',
    '& > img': {
      height: '100%',
    },
    zIndex: 4,
  },
  notifications: {
    zIndex: 2,
  },
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '.9vh',
    left: '.4vh',
    height: 'calc(100% - 2.1vh)',
    width: 'calc(100% - .8vh)',
    backgroundSize: 'cover!important',
    backgroundRepeat: 'round',
    zIndex: 1,
    borderRadius: '3%',
  },
  activeApp: {
    height: '100%',
    width: '100%',
    overflow: 'auto',
    position: 'relative',
  },
  bigPhoto: {
    position: 'absolute',
    left: '-55vh',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      width: '50vh',
      height: 'fit-content',
      objectFit: 'contain',
      '& > img': {
        height: '100%',
        width: '100%',
      },
    },
  },
});
