RegisterUICallback('phone/twitter/getTweets', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:getTweets', function(tweets)
    cb({ data = tweets, meta = { ok = true, message = 'done' } })
  end, data)
end)

RegisterUICallback('phone/twitter/new', function(data, cb)
  TriggerServerEvent('dg-phone:server:twitter:newTweet', data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/twitter/addLike', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:twitter:addLike', function()
  end, data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)
RegisterUICallback('phone/twitter/removeLike', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:twitter:removeLike', function()
  end, data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/twitter/addRetweet', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:twitter:addRetweet', function()
  end, data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/twitter/deleteTweet', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:twitter:deleteTweet', function()
  end, data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterNetEvent('dg-phone:client:newTweet', function(tweet)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'newTweet',
    data = tweet
  })
end)

RegisterNetEvent('dg-phone:client:twitter:addLike', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'addLike',
    data = tweetid
  })
end)

RegisterNetEvent('dg-phone:client:twitter:removeLike', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'removeLike',
    data = tweetid
  })
end)

RegisterNetEvent('dg-phone:client:twitter:addRetweet', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'addRetweet',
    data = tweetid
  })
end)

RegisterNetEvent('dg-phone:client:twitter:deleteTweet', function(tweetid)
  SendAppEvent('phone', {
    appName = 'twitter',
    action = 'deleteTweet',
    data = tweetid
  })
end)