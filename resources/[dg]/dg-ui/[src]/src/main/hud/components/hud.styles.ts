import { makeStyles } from '@mui/styles';

import { isDevel } from '../../../lib/env';

export const stylesBaseProps = {
  extraCirc: 0,
};

declare interface StyleProps {
  extraCirc: number;
}

export const styles = makeStyles({
  wrapper: {
    position: 'relative',
    color: 'black',
    height: '100%',
    pointerEvents: 'none',
    '& > *': {
      pointerEvents: 'all',
    },
  },
  compassWrapper: {},
  hudWrapper: {
    position: 'absolute',
    bottom: '2vh',
    right: '2vh',
    backgroundColor: isDevel() ? 'white' : 'transparent',
  },
  hudOuterCircle: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: '50%',
    minWidth: ({ extraCirc }: StyleProps) => `${17 + extraCirc * 2}.75vh`,
    minHeight: ({ extraCirc }: StyleProps) => `${17 + extraCirc * 2}.75vh`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudIcons: {
    position: 'absolute',
    width: '10.5vh',
    height: '10.5vh',
    display: 'flex',
    '& > div': {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      '&.right': {
        alignItems: 'flex-end',
      },
    },
  },
  hudInnerWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  hudInnerCircle: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudVoice: {
    position: 'absolute',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
