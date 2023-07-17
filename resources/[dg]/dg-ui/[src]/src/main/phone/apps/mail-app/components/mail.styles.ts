import makeStyles from '@mui/styles/makeStyles';

import { baseStyle } from '../../../../../base.styles';

export const styles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1vh',
  },
  entry: {
    width: '100%',
    backgroundColor: baseStyle.primary.darker,
    borderBottom: `.2vh solid ${baseStyle.gray.light}`,
    borderRadius: '.4vh',
  },
  textWrapper: {
    fontSize: '.9rem',
    margin: '1vh .9vh',
    display: 'flex',
    flexDirection: 'column',
    borderBottom: `.1vh solid ${baseStyle.gray.light}`,
    '& > *': {
      marginBottom: '0.8vh',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
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
    marginBottom: '0.8vh',
  },
});
