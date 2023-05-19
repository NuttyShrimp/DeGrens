import { makeStyles } from '@mui/styles';

import { baseStyle } from '../../../../../base.styles';

export const styles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tweet: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0b57a6',
    width: '100%',
    padding: '.5vh 0.75vh',
    borderRadius: '.5vh',
    boxShadow: '0px 3px 5px 0px black',
    marginBottom: '1vh',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'start',
    fontSize: '0.9rem',
    '& > p:last-child': {
      // textAlign: 'right',
      // alignSelf: 'flex-end',
      color: baseStyle.gray.light,
      fontSize: '0.8rem',
    },
  },
  body: {
    marginTop: '.5vh',
    fontSize: '.9rem',
  },
  btns: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '.5vh',
    '& .like button:hover': {
      color: '#ff4242',
    },
    '& .retweet button:hover': {
      color: '#2ecc71',
    },
    '& .delete button:hover': {
      color: '#2ecc71',
    },
  },
});
