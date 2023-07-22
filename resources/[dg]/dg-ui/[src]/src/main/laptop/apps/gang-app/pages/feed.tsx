import { FC, useState } from 'react';
import { Button, Divider } from '@mui/material';
import { Stack } from '@mui/system';
import { devData } from '@src/lib/devdata';
import { nuiAction } from '@src/lib/nui-comms';
import { formatRelativeTime } from '@src/lib/util';

import { useGangApp } from '../stores/useGangAppStore';

export const Feed: FC = () => {
  const { feedMessages, updateStore, name: gangName } = useGangApp();
  const [canLoadMore, setCanLoadMore] = useState(true);

  const loadMore = async () => {
    const data = await nuiAction<{ feedMessages: Gangs.Feed.Message[]; canLoadMore: boolean }>(
      'laptop/gang/getFeedMessages',
      {
        gang: gangName,
        offset: feedMessages.length,
      },
      devData.laptopGangExtraFeedMessages
    );
    setCanLoadMore(data.canLoadMore);
    updateStore(s => ({
      ...s,
      feedMessages: [...s.feedMessages, ...data.feedMessages],
    }));
  };

  return (
    <div className='laptop-gang-feed'>
      <Stack spacing={1}>
        {feedMessages.map(feedMessage => (
          <FeedMessage key={`gang_feed_item_${feedMessage.id}`} {...feedMessage} />
        ))}
        {canLoadMore && (
          <div className='load-more'>
            <Button variant='outlined' onClick={loadMore} color={'secondary'} size='small'>
              load more
            </Button>
          </div>
        )}
      </Stack>
    </div>
  );
};

export const FeedMessage: FC<Gangs.Feed.Message> = props => {
  return (
    <div className='item'>
      <div className='item-top'>
        <p className='item-top-title'>{props.title}</p>
        <p className='item-top-date'>{formatRelativeTime(props.date)}</p>
      </div>
      <Divider />
      <p className='item-content'>{props.content}</p>
    </div>
  );
};
