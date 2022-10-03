import { addNotification, genericAction, getState } from '../../lib';

import { changeTweetStatus } from './lib';

export const events: Phone.Events = {};

events.newTweet = (tweet: Phone.Twitter.Tweet) => {
  const appState = getState<Phone.Twitter.State>('phone.apps.twitter');
  appState.tweets.unshift(tweet);
  genericAction('phone.apps.twitter', appState);
  const characterState = getState<Character>('character');
  if (`${characterState.firstname}_${characterState.lastname}`.replace(' ', '_') === tweet.sender_name) return;
  const configMenu = getState<ConfigMenu.State>('configmenu');
  if (!configMenu.phone.notifications.twitter) return;
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
  const appState = getState<Phone.Twitter.State>('phone.apps.twitter');
  appState.tweets = appState.tweets.filter(tweet => tweet.id !== tweetId);
  genericAction('phone.apps.twitter', appState);
};
