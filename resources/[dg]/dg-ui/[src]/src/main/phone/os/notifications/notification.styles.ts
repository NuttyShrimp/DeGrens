import { makeStyles } from '@mui/styles';

import { baseStyle } from '../../../../base.styles';
import { hexToRGBStr } from '../../../../lib/util';

export const styles = makeStyles({
  list: {
    position: 'absolute',
    width: '100%',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 3,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  innerList: {
    width: '85%',
  },
  box: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '.5vh',
    backgroundColor: hexToRGBStr(baseStyle.primary.darker, 0.92),
    borderRadius: '.5vh',
    transition: 'background-color .2s ease-in-out',
    pointerEvents: 'all',
    '& > *': {
      pointerEvents: 'none',
    },
    '&:hover': {
      backgroundColor: baseStyle.primary.darker,
    },
    '& > div': {
      padding: '.5vh .9vh',
    },
  },
  info: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: '.5vh',
    fontSize: '.9rem',
    minWidth: '2.5vh',
    minHeight: '2.5vh',
    borderRadius: '.75vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    width: '18.5vh',
  },
  text: {
    width: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  title: {
    fontSize: '.9rem',
    fontWeight: 'bold',
    height: '.9rem',
    lineHeight: '1',
  },
  description: {
    fontSize: '.8rem',
    height: '.8rem',
    lineHeight: '1',
  },
  btns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: '.3vh',
    userSelect: 'none',
    '& button': {
      pointerEvents: 'all',
      '& *': {
        pointerEvents: 'all',
      },
    },
  },
});
