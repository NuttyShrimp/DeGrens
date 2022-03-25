import makeStyles from '@mui/styles/makeStyles';

import { baseStyle } from '../../../../../base.styles';

export const styles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  entry: {
    width: '100%',
    backgroundColor: baseStyle.primary.darker,
    borderBottom: `.2vh solid ${baseStyle.gray.light}`,
    borderRadius: '.5vh',
    boxShadow: '0px 3px 5px 0px black',
  },
  textWrapper: {
    fontSize: '.9rem',
    margin: '1vh .9vh',
    display: 'flex',
    flexDirection: 'column',
    borderBottom: `.1vh solid ${baseStyle.gray.light}`,
    '& > *': {
      marginBottom: '1vh',
    },
  },
  body: {
    fontSize: '.8rem',
    '&.small': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  },
  date: {
    textAlign: 'center',
    fontSize: '.8rem',
    marginBottom: '1vh',
  },
});
