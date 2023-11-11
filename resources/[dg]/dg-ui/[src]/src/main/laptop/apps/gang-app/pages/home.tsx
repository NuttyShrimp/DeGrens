import { FC, useCallback, useEffect, useState } from 'react';
import { Button, Typography } from '@mui/material';
import { IconButton } from '@src/components/button';
import { Icon } from '@src/components/icon';
import { Input } from '@src/components/inputs';
import { nuiAction } from '@src/lib/nui-comms';
import { formatRelativeTime } from '@src/lib/util';
import { useActions } from '@src/main/laptop/hooks/useActions';

export const Home: FC<{ label: string; gangName: string; isOwner: boolean; fetchGangData: () => Promise<void> }> = ({
  label,
  gangName,
  isOwner,
  fetchGangData,
}) => {
  const { addNotification, openConfirm } = useActions();
  const [msg, setMsg] = useState('');
  const [feedMsgs, setFeedMsgs] = useState<Laptop.Gang.FeedMsg[]>([]);

  const handleLeave = useCallback(async () => {
    if (isOwner) {
      addNotification('gang', 'Je kan dit niet als eigenaar');
      return;
    }
    openConfirm({
      label: 'Ben je zeker dat je de gang wil verlaten?',
      onAccept: async () => {
        const result = await nuiAction<{ success: boolean }>('laptop/gang/leave', { gang: gangName }, true);
        if (!result.success) {
          addNotification('gang', 'Er is iets misgelopen met deze actie');
        }
        fetchGangData();
      },
    });
  }, [isOwner, gangName]);

  const fetchFeed = async () => {
    const result = await nuiAction<Laptop.Gang.FeedMsg[]>('laptop/gang/msgs', {}, []);
    setFeedMsgs(result);
  };

  const sendMessage = async () => {
    if (msg === '') return;
    await nuiAction('laptop/gang/sendMessage', { message: msg }, true);
    setMsg('');
    await fetchFeed();
  };

  useEffect(() => {
    fetchFeed();
  }, [gangName]);

  return (
    <div className='laptop-gang-home'>
      <p>Huidige gang: {label}</p>
      <br />
      <Typography variant='h6'>Chat</Typography>
      <div className='laptop-gang-home-chat-container'>
        <div className='laptop-gang-home-chat-feed'>
          {feedMsgs.map(msg => (
            <div key={msg.id} className='laptop-gang-home-chat-feed-msg'>
              <div className='laptop-gang-home-chat-feed-msg-top'>
                <p className='laptop-gang-home-chat-feed-msg-top-author'>{msg.sender}</p>
                <p className='laptop-gang-home-chat-feed-msg-top-date'>{formatRelativeTime(msg.date)}</p>
              </div>
              <p className='laptop-gang-home-chat-feed-msg-content'>{msg.message}</p>
            </div>
          ))}
        </div>
        <div className='laptop-gang-home-chat-input'>
          <Input.TextField
            onKeyDown={e => {
              if (e.key !== 'Enter') return;
              sendMessage();
            }}
            variant='outlined'
            placeholder='Your chat message'
            value={msg}
            onChange={v => setMsg(v)}
          />
          <div>
            <IconButton.Primary onClick={() => sendMessage()}>
              <Icon name='paper-plane' />
            </IconButton.Primary>
          </div>
        </div>
      </div>
      <div>
        <Button variant='outlined' onClick={handleLeave} color={'secondary'} size='small'>
          leave
        </Button>
      </div>
    </div>
  );
};
