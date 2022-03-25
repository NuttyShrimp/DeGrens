import React, { FC, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
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

import { styles } from './messages.styles';

export const Conversation: FC<Phone.Messages.Props> = props => {
  // We use the selector state bcs the props state is to inconsistent
  const messageState = useSelector<RootState, Phone.Messages.State>(state => state['phone.apps.messages']);
  const [messages, setMessages] = useState<Phone.Messages.Message[]>([]);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [message, setMessage] = useState('');
  const classes = styles();
  const messageListRef = useRef<HTMLDivElement>(null);

  const showList = () => {
    props.updateState({
      currentNumber: null,
    });
  };

  const loadMore = async () => {
    if (!messageState.currentNumber) return;
    const newMes = await nuiAction<Record<string, Phone.Messages.Message[]>>('phone/messages/get', {
      target: messageState.currentNumber,
      offset: messages.length,
    });
    if (typeof newMes !== 'object' || Array.isArray(newMes) || newMes[messageState.currentNumber].length === 0) {
      console.log('could not load more messages');
      setCanLoadMore(false);
      return;
    }
    addMessage(messageState.currentNumber, newMes[messageState.currentNumber], 'prepend');
  };

  const sendMessage = () => {
    nuiAction('phone/messages/send', {
      msg: message,
      target: messageState.currentNumber,
      date: Date.now(),
    });
    setMessage('');
  };

  useEffect(() => {
    setTimeout(() => {
      if (!messageListRef.current) return;
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, 10);
  }, [messageState.messages]);

  useEffect(() => {
    if (!messageState.currentNumber) {
      setMessages([]);
      setCanLoadMore(true);
      return;
    }
    if (!messageState.messages[messageState.currentNumber]) {
      setCanLoadMore(false);
      return;
    }
    if (messageState.messages[messageState.currentNumber] === messages) {
      return;
    }
    if (messageState.messages[messageState.currentNumber].length - messages.length === 1) {
      setTimeout(() => {
        if (!messageListRef.current) return;
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }, 10);
    }
    setMessages(messageState.messages[messageState.currentNumber]);
  }, [messageState]);

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
                  onEnter={sendMessage}
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
