RegisterNUICallback('twitter/getTweets', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:getTweets', function(tweets)
		cb({ data = tweets, meta={ok=true, message='done'}})
	end, data)
end)

RegisterNUICallback('twitter/new', function(data, cb)
	TriggerServerEvent('dg-phone:server:twitter:newTweet', data)
	cb({data={}, meta={ok=true, message='done'}})
end)

RegisterNUICallback('twitter/addLike', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:twitter:addLike', function()end, data)
	cb({data={}, meta={ok=true, message='done'}})
end)
RegisterNUICallback('twitter/removeLike', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:twitter:removeLike', function()end, data)
	cb({data={}, meta={ok=true, message='done'}})
end)

RegisterNUICallback('twitter/addRetweet', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:twitter:addRetweet', function()end, data)
	cb({data={}, meta={ok=true, message='done'}})
end)

RegisterNUICallback('twitter/deleteTweet', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:twitter:deleteTweet', function()end, data)
	cb({data={}, meta={ok=true, message='done'}})
end)

RegisterNetEvent('dg-phone:client:newTweet', function(tweet)
	SendNUIMessage({
		app = 'twitter',
		action = 'newTweet',
		data = tweet
	})
end)

RegisterNetEvent('dg-phone:client:twitter:addLike', function(tweetid)
	SendNUIMessage({
		app = 'twitter',
		action = 'addLike',
		data = tweetid
	})
end)

RegisterNetEvent('dg-phone:client:twitter:removeLike', function(tweetid)
	SendNUIMessage({
		app = 'twitter',
		action = 'removeLike',
		data = tweetid
	})
end)

RegisterNetEvent('dg-phone:client:twitter:addRetweet', function(tweetid)
	SendNUIMessage({
		app = 'twitter',
		action = 'addRetweet',
		data = tweetid
	})
end)

RegisterNetEvent('dg-phone:client:twitter:deleteTweet', function(tweetid)
	SendNUIMessage({
		app = 'twitter',
		action = 'deleteTweet',
		data = tweetid
	})
end)