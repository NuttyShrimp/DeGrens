import { makeStyles } from '@mui/styles';

import { baseStyle } from '../../../../../base.styles';

export const styles = makeStyles({
  wrapper: {
    height: '100%',
    width: '100%',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  conversationWrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    '& button': {
      alignSelf: 'center',
    },
  },
  messageWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    flex: '1',
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '75%',
    margin: '.5vh 0',
    fontSize: '.9rem',
    '& > .text': {
      width: 'fit-content',
      padding: '1vh .9vh',
      borderRadius: '2vh',
    },
    '& > .time': {
      color: baseStyle.gray.light,
      marginTop: '.1vh',
      marginLeft: '.9vh',
    },
  },
  receiver: {
    alignSelf: 'flex-start',
    '& > .text': {
      color: 'white',
      backgroundColor: baseStyle.gray.normal,
      alignSelf: 'flex-start',
    },
    '& > .time': {
      textAlign: 'start',
    },
  },
  sender: {
    alignSelf: 'flex-end',
    '& > .text': {
      color: 'black',
      backgroundColor: '#6aaee0',
      alignSelf: 'flex-end',
    },
    '& > .time': {
      alignSelf: 'flex-end',
    },
  },
  inputWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },
});
