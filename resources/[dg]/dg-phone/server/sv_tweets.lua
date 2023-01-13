TWEET_BATCH_SIZE = 20
-- Build based on users askings
tweetCache={}

local getHighestKey = function(obj)
  local key = 0
  for k, v in pairs(obj) do
    if tonumber(k) > key then
      key = tonumber(k)
    end
  end
  return key
end

getTweets = function(cid, recBatches, force)
	-- Get 20 tweets from cache skipping the first recBatches * 20 tweets
	local tweets = {}
	local skippedTweets = 0
	for i = getHighestKey(tweetCache), 1, -1 do
    if skippedTweets < recBatches * TWEET_BATCH_SIZE then
      skippedTweets = skippedTweets + 1
    else
      tweets[#tweets+1] = tweetCache[i]
    end
  end
	-- Check if tweets has TWEET_BATCH_SIZE tweets
	if #tweets < TWEET_BATCH_SIZE and not force then
		fetchTweets(recBatches)
		return getTweets(cid, recBatches, true)
	end
	-- Reverse tweets table
  for i = 1, #tweets / 2 do
    tweets[i], tweets[#tweets - i + 1] = tweets[#tweets - i + 1], tweets[i]
  end
	for k,t in pairs(tweets) do
		statusInfo = fetchActionStatus(cid, t.id)
		t.liked = statusInfo.liked or false
		t.retweeted = statusInfo.retweeted or false
		tweets[k] = t
	end
	return tweets
end

--- @param batchReceived number amount of batches user has previously received
fetchTweets = function(batchReceived)
	local query = [[
		SELECT pt.*,
		       CONCAT(p.firstname, ' ', p.lastname) AS sender_name,
		       (
		           SELECT COUNT(*) AS like_count
		           FROM phone_tweets_likes
		           WHERE tweetid = pt.id
		       )                                    AS like_count,
		       (
		           SELECT COUNT(*) AS retweet_count
		           FROM phone_tweets_retweets
		           WHERE tweetid = pt.id
		       )                                    AS retweet_count
		FROM phone_tweets AS pt
        JOIN character_info AS p ON p.citizenid = pt.cid
		ORDER BY id DESC
		LIMIT ? OFFSET ?;
	]]
	local tweets = exports['dg-sql']:query(query, {TWEET_BATCH_SIZE, batchReceived * TWEET_BATCH_SIZE})
	if tweets then
		for i, tweet in ipairs(tweets) do
			tweets[i].sender_name = "@"..tweet.sender_name:gsub(" ", "_")
			tweets[i].cid = nil
			tweetCache[tweet.id] = tweets[i]
		end
	end
end

-- Fetch if user has liked tweet & retweeted tweet
fetchActionStatus = function(cid, tweetid)
	local query = [[
		SELECT
			(
				SELECT COUNT(*)
				FROM phone_tweets_likes
				WHERE tweetid = ? AND cid = ?
			)                                    AS liked,
			(
				SELECT COUNT(*)
				FROM phone_tweets_retweets
				WHERE tweetid = ? AND cid = ?
			)                                    AS retweeted
	]]
	local result = exports['dg-sql']:query(query, {tweetid, cid, tweetid, cid})
	if result then
		return result[1]
	end
	return false
end

addTweet = function(src, tweet, date)
	local Player = DGCore.Functions.GetPlayer(src)
	local query = [[
		INSERT INTO phone_tweets (cid, tweet, date)
		VALUES (?, ?, ?);
	]]
	local id = exports['dg-sql']:insert(query, { Player.PlayerData.citizenid, tweet, date})
	tweetCache[id] = {
		id = id,
		cid = cid,
		tweet = tweet,
		date = date,
		sender_name = "@"..('%s %s'):format(Player.PlayerData.charinfo.firstname, Player.PlayerData.charinfo.lastname):gsub(" ", "_"),
		liked = 0,
		like_count = 0,
		retweeted = 0,
		retweet_count = 0,
	}
	return id
end

likeTweet = function(cid, tweetId)
	local query=[[
		INSERT INTO phone_tweets_likes (cid, tweetid)
		VALUES (?, ?);
	]]
	exports['dg-sql']:query(query, {cid, tweetId})
end

DGX.RPC.register('dg-phone:server:getTweets', function(src, offset)
	local Player = DGCore.Functions.GetPlayer(src)
	local tweets = getTweets(Player.PlayerData.citizenid, offset)
	return tweets
end)

DGX.Events.onNet('dg-phone:server:twitter:addLike', function(src, tweetId)
	if not tweetId or not tweetCache[tweetId] then return end

	local Player = DGCore.Functions.GetPlayer(src)
	tweetCache[tweetId].like_count = tweetCache[tweetId].like_count + 1
	likeTweet(Player.PlayerData.citizenid, tweetId)
	DGX.Events.emitNet('dg-phone:client:twitter:addLike', -1, tweetId)

  DGX.Util.Log('phone:tweet:addLike', {tweetId = tweetId}, ('%s has added a like to a tweet'):format(DGX.Util.getName(src)), src)
end)

DGX.Events.onNet('dg-phone:server:twitter:removeLike', function(src, tweetId)
	if not tweetId or not tweetCache[tweetId] then return end

	local Player = DGCore.Functions.GetPlayer(src)
	tweetCache[tweetId].like_count = tweetCache[tweetId].like_count - 1
	local query = [[
		DELETE FROM phone_tweets_likes
		WHERE cid = ? AND tweetid = ?;
	]]
	exports['dg-sql']:query(query, {Player.PlayerData.citizenid, tweetId})
	DGX.Events.emitNet('dg-phone:client:twitter:removeLike', -1, tweetId)

  DGX.Util.Log('phone:tweet:removeLike', {tweetId = tweetId}, ('%s has removed a like from a tweet'):format(DGX.Util.getName(src)), src)
end)

DGX.Events.onNet('dg-phone:server:twitter:addRetweet', function(src, tweetId)
	if not tweetId or not tweetCache[tweetId] then return end

	local Player = DGCore.Functions.GetPlayer(src)
	tweetCache[tweetId].retweet_count = tweetCache[tweetId].retweet_count + 1
	local query = [[
		INSERT INTO phone_tweets_retweets (cid, tweetid)
		VALUES (?, ?);
	]]
	exports['dg-sql']:query(query, {Player.PlayerData.citizenid, tweetId})
	DGX.Events.emitNet('dg-phone:client:twitter:addRetweet', -1, tweetId)

  DGX.Util.Log('phone:tweet:addRetweet', {tweetId = tweetId}, ('%s has retweeted a tweet'):format(DGX.Util.getName(src)), src)
end)

DGX.Events.onNet('dg-phone:server:twitter:deleteTweet', function(src, tweetId)
	if not tweetId or not tweetCache[tweetId] then return end

  if not DGX.Admin.hasPermission(src, 'staff') then
		DGX.Admin.ACBan(src, 'Try to remove tweet')
    return
	end

	local query = [[
		DELETE FROM phone_tweets
		WHERE id = ?;
	]]
	exports['dg-sql']:query(query, {tweetId})
	DGX.Events.emitNet('dg-phone:client:twitter:deleteTweet', -1, tweetId)

  DGX.Util.Log('phone:tweet:deleteTweet', {tweetId = tweetId}, ('%s has deleted a tweet'):format(DGX.Util.getName(src)), src)
end)

DGX.Events.onNet('dg-phone:server:twitter:newTweet', function(src, message, date)
	local insertId = addTweet(src, message, date)
  local _tweet = tweetCache[insertId]
  _tweet.liked = false
  _tweet.retweeted = false
  DGX.Events.emitNet('dg-phone:client:newTweet', -1, _tweet)

  DGX.Util.Log('phone:tweet:newTweet', {tweetId = insertId, message = message}, ('%s has posted a tweet'):format(DGX.Util.getName(src)), src)
end)