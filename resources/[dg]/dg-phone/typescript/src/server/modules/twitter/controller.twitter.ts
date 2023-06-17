import { Admin, Events, RPC, Util } from '@dgx/server';
import { charModule } from 'helpers/core';
import {
  addRetweet,
  addTweet,
  clearTweetCache,
  deleteTweet,
  getTweets,
  isTweetCached,
  likeTweet,
  removeTweetLike,
} from './service.twitter';

RPC.register('dg-phone:server:getTweets', async (src, offset: number) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  const tweets = await getTweets(player.citizenid, offset);
  return tweets;
});

Events.onNet('dg-phone:server:twitter:addLike', (src, tweetId: number) => {
  if (!tweetId || !isTweetCached(tweetId)) return;

  const player = charModule.getPlayer(src);
  if (!player) return;
  likeTweet(player.citizenid, tweetId);

  Util.Log('phone:tweet:addLike', { tweetId: tweetId }, `${Util.getName(src)} has added a like to a tweet`, src);
});

Events.onNet('dg-phone:server:twitter:removeLike', (src, tweetId: number) => {
  if (!tweetId || !isTweetCached(tweetId)) return;

  const player = charModule.getPlayer(src);
  if (!player) return;
  removeTweetLike(player.citizenid, tweetId);

  Util.Log('phone:tweet:removeLike', { tweetId: tweetId }, `${Util.getName(src)} has removed a like from a tweet`, src);
});

Events.onNet('dg-phone:server:twitter:addRetweet', (src, tweetId: number) => {
  if (!tweetId || !isTweetCached(tweetId)) return;

  const player = charModule.getPlayer(src);
  if (!player) return;
  addRetweet(player.citizenid, tweetId);

  Util.Log('phone:tweet:addRetweet', { tweetId: tweetId }, `${Util.getName(src)} has added a retweet to a tweet`, src);
});

Events.onNet('dg-phone:server:twitter:deleteTweet', (src, tweetId: number) => {
  if (!tweetId || !isTweetCached(tweetId)) return;

  if (!Admin.hasPermission(src, 'support')) {
    Admin.ACBan(src, 'Try to remove tweet without permissions');
    return;
  }

  const player = charModule.getPlayer(src);
  if (!player) return;
  deleteTweet(player.citizenid, tweetId);

  Util.Log('phone:tweet:deleteTweet', { tweetId: tweetId }, `${Util.getName(src)} has deleted a tweet`, src);
});

Events.onNet('dg-phone:server:twitter:newTweet', async (src, message, date) => {
  const insertId = await addTweet(src, message, date);

  Util.Log(
    'phone:tweet:newTweet',
    { tweetId: insertId, tweetMessage: message },
    `${Util.getName(src)} has posted a tweet`,
    src
  );
});

RegisterCommand(
  'phone:twitter:invalidateCache',
  (src: number) => {
    clearTweetCache();
  },
  true
);
