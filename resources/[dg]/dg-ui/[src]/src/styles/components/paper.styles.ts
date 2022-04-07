import { makeStyles } from '@mui/styles';

import { baseStyle } from '../../base.styles';

export const styles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '1vh',
    color: baseStyle.gray.lighter,
    backgroundColor: baseStyle.primaryDarker.dark,
    borderBottom: `.2vh solid ${baseStyle.gray.light}`,
    borderRadius: '0.3vh',
    boxShadow: '0px 3px 5px 0px black',
    padding: '0.9vh',
    position: 'relative',
    '&.imgonly': {
      padding: '0.4vh',
      '& .paper-image': {
        marginRight: '0!important',
        fontSize: '0em!important',
        width: '100%!important',
      },
    },
    '&:not(.extended):not(.keepBackground):hover': {
      backgroundColor: baseStyle.primary.dark,
    },
  },
  actionList: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    padding: '0 0.5vh',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '0',
    left: '0',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  actionEntry: {
    cursor: 'pointer',
    color: baseStyle.gray.lighter,
    margin: '.3vh .5vw 0',
    fontSize: '1.2em',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  innerDetails: {
    display: 'flex',
    flexDirection: 'row',
    '& > .paper-image': {
      marginRight: '0.9vh',
      alignSelf: 'center',
      fontSize: '2.25rem',

      '& img': {
        height: '100%',
        width: '100%',
        objectFit: 'contain',
      },
    },
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    '& > .paper-title, & > .paper-description': {
      width: '100%',
      display: '-webkit-box',
      overflow: 'hidden',
      '-webkit-line-clamp': '1',
      '-webkit-box-orient': 'vertical',
    },
    '& > .paper-title': {
      marginBottom: '0.5vh',
      fontSize: '1em',
    },
    '& > .paper-description': {
      fontSize: '.9em',
    },
  },
  extDescription: {
    marginBottom: '.5vh',
    fontSize: '.9em',
  },
});
