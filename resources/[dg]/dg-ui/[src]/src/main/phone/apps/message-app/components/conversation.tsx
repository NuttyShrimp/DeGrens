import React, { useEffect, useRef, useState } from 'react';
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

export const Conversation: AppFunction<Phone.Messages.State> = props => {
  // We use the selector state bcs the props state is to inconsistent
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
    if (!props.currentNumber) return;
    const newMes = await nuiAction<Record<string, Phone.Messages.Message[]>>('phone/messages/get', {
      target: props.currentNumber,
      offset: messages.length,
    });
    if (typeof newMes !== 'object' || Array.isArray(newMes) || newMes[props.currentNumber].length === 0) {
      console.log('could not load more messages');
      setCanLoadMore(false);
      return;
    }
    addMessage(props.currentNumber, newMes[props.currentNumber], 'prepend');
  };

  const sendMessage = () => {
    nuiAction('phone/messages/send', {
      msg: message,
      target: props.currentNumber,
      date: Date.now(),
    });
    setMessage('');
  };

  useEffect(() => {
    setTimeout(() => {
      if (!messageListRef.current) return;
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, 10);
  }, [props.messages]);

  useEffect(() => {
    if (!props.currentNumber) {
      setMessages([]);
      setCanLoadMore(true);
      return;
    }
    if (!props.messages[props.currentNumber]) {
      setCanLoadMore(false);
      return;
    }
    if (props.messages[props.currentNumber] === messages) {
      return;
    }
    if (props.messages[props.currentNumber].length - messages.length === 1) {
      setTimeout(() => {
        if (!messageListRef.current) return;
        messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      }, 10);
    }
    setMessages(props.messages[props.currentNumber]);
  }, [props]);

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
