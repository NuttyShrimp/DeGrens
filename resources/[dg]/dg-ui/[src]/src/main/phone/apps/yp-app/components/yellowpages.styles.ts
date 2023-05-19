import makeStyles from '@mui/styles/makeStyles';

import { baseStyle } from '../../../../../base.styles';

export const styles = makeStyles({
  list: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  entry: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#e2cf1c',
    color: baseStyle.gray.dark,
    //border: `0.1vh solid ${baseStyle.gray.dark}`,
    borderRadius: '.5vh',
    boxShadow: '0px 3px 5px 0px black',
    textAlign: 'center',
    '&:not(:last-child)': {
      marginBottom: '1vh',
    },
    '& > div': {
      padding: '.3vh .5vh',
      borderBottom: `0.1vh solid ${baseStyle.gray.dark}40`,
    },
    '& > .title': {
      fontSize: '1.1rem',
    },
    '& > .description': {
      fontSize: '0.9rem',
    },
  },
  btnWrapper: {
    display: 'flex',
    flexDirection: 'row',
    fontSize: '0.8rem',
    textAlign: 'left',
    color: `${baseStyle.gray.dark}d0`,
  },
  btn: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '.3vh .5vh',
    '&:not(:last-child)': {
      borderRight: `0.1vh solid ${baseStyle.gray.dark}40`,
    },
    '& > .MuiIcon-root': {
      marginRight: '0.5vh',
    },
  },
});
