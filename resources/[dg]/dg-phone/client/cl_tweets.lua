-- dont use full data gotten from ui callback, data includes more than needed for event

RegisterUICallback('phone/twitter/getTweets', function(data, cb)
  local tweets = DGX.RPC.execute('dg-phone:server:getTweets', data.recBatches)
  cb({ data = tweets, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/twitter/new', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:twitter:newTweet', data.tweet, data.date)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/twitter/addLike', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:twitter:addLike', data.tweetId)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)
RegisterUICallback('phone/twitter/removeLike', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:twitter:removeLike', data.tweetId)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/twitter/addRetweet', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:twitter:addRetweet', data.tweetId)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/twitter/deleteTweet', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:twitter:deleteTweet', data.tweetId)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

DGX.Events.onNet('dg-phone:client:newTweet', function(tweet)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'newTweet',
    data = tweet
  })
end)

DGX.Events.onNet('dg-phone:client:twitter:addLike', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'addLike',
    data = tweetid
  })
end)

DGX.Events.onNet('dg-phone:client:twitter:removeLike', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'removeLike',
    data = tweetid
  })
end)

DGX.Events.onNet('dg-phone:client:twitter:addRetweet', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'addRetweet',
    data = tweetid
  })
end)

DGX.Events.onNet('dg-phone:client:twitter:deleteTweet', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'deleteTweet',
    data = tweetid
  })
end)