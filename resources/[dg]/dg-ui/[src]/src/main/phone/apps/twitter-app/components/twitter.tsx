import { FC, useState } from 'react';
import * as React from 'react';
import { Divider, IconButton } from '@mui/material';
import { useMainStore } from '@src/lib/stores/useMainStore';

import { Button } from '../../../../../components/button';
import { Textwrapper } from '../../../../../components/textwrapper';
import { formatRelativeTime } from '../../../../../lib/util';
import { useTwitterAppStore } from '../stores/useTwitterAppStore';

import { styles } from './twitter.styles';

export const Tweet: FC<
  React.PropsWithChildren<
    { tweet: Phone.Twitter.Tweet } & {
      toggleLike: (tweetId: number, isLiked: boolean) => void;
      doRetweet: (tweet: Phone.Twitter.Tweet) => void;
      doDelete: (tweetId: number) => void;
    }
  >
> = ({ tweet, ...props }) => {
  const isAdmin = useMainStore(s => s.character.isAdmin);
  const classes = styles();

  return (
    <div className={classes.tweet}>
      <div className={classes.header}>
        <p>{tweet.sender_name}</p>
        <p>{formatRelativeTime(tweet.date)}</p>
      </div>
      <Divider />
      <div className={classes.body}>
        <Textwrapper>{tweet.tweet}</Textwrapper>
      </div>
      <div className={classes.btns}>
        <div className={'like'}>
          <IconButton
            size={'small'}
            sx={{
              color: tweet.liked ? '#ff4242' : '#fff',
            }}
            onClick={() => props.toggleLike(tweet.id, tweet.liked)}
          >
            {tweet.liked ? <i className='fas fa-heart' /> : <i className='far fa-heart' />}
          </IconButton>
          {tweet.like_count}
        </div>
        <div className={'retweet'}>
          <IconButton
            size={'small'}
            sx={{
              color: tweet.retweeted ? '#2ecc71' : '#fff',
            }}
            onClick={() => (tweet.retweeted ? {} : props.doRetweet(tweet))}
          >
            {tweet.retweeted ? <i className='fas fa-retweet' /> : <i className='fal fa-retweet' />}
          </IconButton>
          {tweet.retweet_count}
        </div>
        {isAdmin && (
          <div className={'delete'}>
            <IconButton
              size={'small'}
              sx={{
                color: '#fff',
              }}
              onClick={() => props.doDelete(tweet.id)}
            >
              <i className='fas fa-trash-can' />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};

export const Twitter: FC<
  React.PropsWithChildren<{
    toggleLike: (tweetId: number, isLiked: boolean) => void;
    doRetweet: (tweet: Phone.Twitter.Tweet) => void;
    doDelete: (tweetId: number) => void;
    fetchTweets: () => Promise<void>;
  }>
> = props => {
  const classes = styles();
  const [disableLoad, setDisableLoad] = useState(false);
  const tweets = useTwitterAppStore(s => s.tweets);

  const loadMore = async () => {
    if (disableLoad) return;
    setDisableLoad(true);
    await props.fetchTweets();
    setDisableLoad(false);
  };

  return (
    <div className={classes.root}>
      {tweets.map(tweet => (
        <Tweet
          key={`phone-twt-${tweet.id}`}
          tweet={tweet}
          toggleLike={props.toggleLike}
          doDelete={props.doDelete}
          doRetweet={props.doRetweet}
        />
      ))}
      <Button.Primary disabled={disableLoad} onClick={loadMore}>
        Laad meer
      </Button.Primary>
    </div>
  );
};
