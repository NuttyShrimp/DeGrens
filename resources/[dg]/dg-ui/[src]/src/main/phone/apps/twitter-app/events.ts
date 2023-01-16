import { useMainStore } from '@src/lib/stores/useMainStore';
import { useConfigmenuStore } from '@src/main/configmenu/stores/useConfigmenuStore';

import { addNotification } from '../../lib';

import { useTwitterAppStore } from './stores/useTwitterAppStore';
import { changeTweetStatus } from './lib';

export const events: Phone.Events = {};

events.newTweet = (tweet: Phone.Twitter.Tweet) => {
  const tweets = useTwitterAppStore.getState().tweets;
  tweets.unshift(tweet);
  useTwitterAppStore.setState({ tweets });

  const characterState = useMainStore.getState().character;
  if (`${characterState.firstname}_${characterState.lastname}`.replace(' ', '_') === tweet.sender_name) return;
  const twitterNotis = useConfigmenuStore.getState().phone.notifications.twitter;
  if (!twitterNotis) return;
  addNotification({
    id: `tweet_${tweet.id}`,
    icon: 'twitter',
    title: `${tweet.sender_name} tweeted`,
    description: tweet.tweet,
    app: 'twitter',
  });
};

events.addLike = (tweetId: number) => {
  changeTweetStatus(tweetId, 'addLike');
};

events.removeLike = (tweetId: number) => {
  changeTweetStatus(tweetId, 'removeLike');
};

events.addRetweet = (tweetId: number) => {
  changeTweetStatus(tweetId, 'addRetweet');
};

events.deleteTweet = (tweetId: number) => {
  let tweets = useTwitterAppStore.getState().tweets;
  tweets = tweets.filter(tweet => tweet.id !== tweetId);
  useTwitterAppStore.setState({ tweets });
};
