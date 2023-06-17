import { useEffect, useRef, useState } from 'react';
import { animated, Spring } from 'react-spring';
import { formatRelativeTime } from '@lib/util';
import SendIcon from '@mui/icons-material/Send';
import { IconButton } from '@mui/material';

import { Button } from '../../../../../components/button';
import { Input } from '../../../../../components/inputs';
import { Textwrapper } from '../../../../../components/textwrapper';
import { nuiAction } from '../../../../../lib/nui-comms';
import { AppContainer } from '../../../os/appcontainer/appcontainer';
import { addMessage } from '../lib';
import { useMessageStoreApp } from '../stores/useMessageStoreApp';

import { styles } from './messages.styles';

export const Conversation = () => {
  // We use the selector state bcs the props state is to inconsistent
  const [messages, setMessages] = useState<Phone.Messages.Message[]>([]);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [message, setMessage] = useState('');
  const classes = styles();
  const messageListRef = useRef<HTMLDivElement>(null);
  const [setNumber, currentNumber, storeMessages] = useMessageStoreApp(s => [s.setNumber, s.currentNumber, s.messages]);

  const showList = () => {
    setNumber(null);
  };

  const loadMore = async () => {
    if (!currentNumber) return;
    const newMes = await nuiAction<Record<string, Phone.Messages.Message[]>>('phone/messages/get', {
      target: currentNumber,
      offset: messages.length,
    });
    if (typeof newMes !== 'object' || Array.isArray(newMes) || newMes[currentNumber].length === 0) {
      console.log('could not load more messages');
      setCanLoadMore(false);
      return;
    }
    addMessage(currentNumber, newMes[currentNumber], 'prepend');
  };

  const sendMessage = () => {
    nuiAction('phone/messages/send', {
      msg: message,
      target: currentNumber,
      date: Date.now(),
    });
    setMessage('');
  };

  useEffect(() => {
    setTimeout(() => {
      if (!messageListRef.current) return;
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, 10);
  }, [storeMessages]);

  useEffect(() => {
    if (!currentNumber) {
      setMessages([]);
      setCanLoadMore(true);
      return;
    }
    if (!storeMessages[currentNumber]) {
      setCanLoadMore(false);
      return;
    }
    if (storeMessages[currentNumber] === messages) {
      return;
    }
    if (storeMessages[currentNumber].length - messages.length === 1) {
      setTimeout(() => {
        if (!messageListRef.current) return;
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }, 10);
    }
    setMessages(storeMessages[currentNumber]);
  }, [storeMessages, currentNumber]);

  return (
    <AppContainer onClickBack={showList}>
      <Spring
        from={{
          translateX: '100%',
          height: '100%',
        }}
        to={{
          translateX: '0%',
          height: '100%',
        }}
      >
        {styles => (
          <animated.div style={styles}>
            <div className={classes.conversationWrapper}>
              <div className={classes.messageWrapper} ref={messageListRef}>
                {canLoadMore && <Button.Primary onClick={loadMore}>Laad meer</Button.Primary>}
                {messages.map(mes => (
                  <div
                    key={`phone-messsage-${mes.id}`}
                    className={[classes.message, mes.isreceiver ? classes.receiver : classes.sender].join(' ')}
                  >
                    <div className={'text'}>
                      <Textwrapper>{mes.message}</Textwrapper>
                    </div>
                    <div className={'time'}>{formatRelativeTime(mes.date)}</div>
                  </div>
                ))}
              </div>
              <div className={classes.inputWrapper}>
                <Input.TextField
                  onChange={val => setMessage(val)}
                  handleEnter={sendMessage}
                  value={message}
                  label={'Bericht'}
                  fullWidth
                />
                {message.trim() !== '' && (
                  <IconButton onClick={sendMessage} color='primary'>
                    <SendIcon />
                  </IconButton>
                )}
              </div>
            </div>
          </animated.div>
        )}
      </Spring>
    </AppContainer>
  );
};
