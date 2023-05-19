// dont use full data gotten from ui callback, data includes more than needed for event

import { Events, RPC, UI } from '@dgx/client';

UI.RegisterUICallback('phone/twitter/getTweets', async (data, cb) => {
  const tweets = await RPC.execute('dg-phone:server:getTweets', data.recBatches);
  cb({ data: tweets, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/twitter/new', (data, cb) => {
  Events.emitNet('dg-phone:server:twitter:newTweet', data.tweet, data.date);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/twitter/addLike', (data, cb) => {
  Events.emitNet('dg-phone:server:twitter:addLike', data.tweetId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/twitter/removeLike', (data, cb) => {
  Events.emitNet('dg-phone:server:twitter:removeLike', data.tweetId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/twitter/addRetweet', (data, cb) => {
  Events.emitNet('dg-phone:server:twitter:addRetweet', data.tweetId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/twitter/deleteTweet', (data, cb) => {
  Events.emitNet('dg-phone:server:twitter:deleteTweet', data.tweetId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('dg-phone:client:newTweet', tweet => {
  UI.SendAppEvent('phone', {
    appName: 'twitter',
    action: 'newTweet',
    data: tweet,
  });
});

Events.onNet('dg-phone:client:twitter:addLike', tweetid => {
  UI.SendAppEvent('phone', {
    appName: 'twitter',
    action: 'addLike',
    data: tweetid,
  });
});

Events.onNet('dg-phone:client:twitter:removeLike', tweetid => {
  UI.SendAppEvent('phone', {
    appName: 'twitter',
    action: 'removeLike',
    data: tweetid,
  });
});

Events.onNet('dg-phone:client:twitter:addRetweet', tweetid => {
  UI.SendAppEvent('phone', {
    appName: 'twitter',
    action: 'addRetweet',
    data: tweetid,
  });
});

Events.onNet('dg-phone:client:twitter:deleteTweet', tweetid => {
  UI.SendAppEvent('phone', {
    appName: 'twitter',
    action: 'deleteTweet',
    enddata: tweetid,
  });
});
