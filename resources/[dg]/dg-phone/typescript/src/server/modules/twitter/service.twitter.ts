import { Events, SQL } from '@dgx/server';
import { charModule } from 'helpers/core';
import { mainLogger } from 'sv_logger';

const TWEET_BATCH_SIZE = 20;
// Build based on users askings
let tweetCache: Record<number, StoredTweet> = {};

export const getTweetById = (tweetId: number): StoredTweet | undefined => {
  return tweetCache[tweetId];
};

export const isTweetCached = (tweetId: number): boolean => {
  return tweetCache[tweetId] !== undefined;
};

export const clearTweetCache = (): void => {
  tweetCache = {};
};

export const getTweets = async (cid: number, recBatches: number, force = false): Promise<Tweet[]> => {
  // Get 20 tweets from cache skipping the first recBatches * 20 tweets
  const tweets: StoredTweet[] = [];
  if (Object.keys(tweetCache).length !== 0) {
    Object.keys(tweetCache)
      .sort((a, b) => Number(a) - Number(b))
      .reverse()
      .slice(recBatches * TWEET_BATCH_SIZE, (recBatches + 1) * TWEET_BATCH_SIZE)
      .forEach(id => {
        tweets.push(tweetCache[Number(id)]);
      });
  }
  // Check if tweets has TWEET_BATCH_SIZE tweets
  if (tweets.length < TWEET_BATCH_SIZE && !force) {
    await fetchTweets(recBatches);
    return getTweets(cid, recBatches, true);
  }
  // Reverse tweets table
  tweets.reverse();

  return await Promise.all(
    tweets.map(async t => {
      return {
        ...t,
        liked: t.liked.includes(cid),
        retweeted: t.retweeted.includes(cid),
      };
    })
  );
};

const fetchTweets = async (batchReceived: number): Promise<void> => {
  const tweets = await SQL.query<StoredTweet[]>(
    `
		SELECT pt.*,
		       CONCAT(p.firstname, ' ', p.lastname) AS sender_name
		FROM phone_tweets AS pt
        JOIN character_info AS p ON p.citizenid = pt.cid
		ORDER BY id DESC
		LIMIT ? OFFSET ?;
	`,
    [TWEET_BATCH_SIZE, batchReceived * TWEET_BATCH_SIZE]
  );
  await Promise.all(
    (tweets ?? []).map(async t => {
      const persons_liked = await SQL.query<{ cid: number }[]>(
        `
            SELECT cid
            FROM phone_tweets_likes
            WHERE tweetid = ?
          `,
        [t.id]
      );
      const persons_retweeted = await SQL.query<{ cid: number }[]>(
        `
            SELECT cid
            FROM phone_tweets_retweets
            WHERE tweetid = ?
          `,
        [t.id]
      );
      t.like_count = persons_liked?.length ?? 0;
      t.retweet_count = persons_retweeted?.length ?? 0;
      t.liked = (persons_liked ?? []).map(p => p.cid);
      t.retweeted = (persons_retweeted ?? []).map(p => p.cid);
      t.sender_name = '@' + t.sender_name.replace(' ', '_');
      tweetCache[t.id] = t;
      delete t.cid;
      return t;
    })
  );
};

export const addTweet = async (src: number, tweet: string, date: number) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  const id = await SQL.insert(
    `
		INSERT INTO phone_tweets (cid, tweet, date)
		VALUES (?, ?, ?);
	`,
    [player.citizenid, tweet, date]
  );
  if (!id) {
    mainLogger.error(`Failed to insert tweet for ${player.citizenid}`, { src, tweet, date });
    return;
  }
  tweetCache[id] = {
    id: id,
    cid: player.citizenid,
    tweet: tweet,
    date: date,
    sender_name: `@${player.charinfo.firstname} ${player.charinfo.lastname}`.replace(' ', '_'),
    liked: [],
    like_count: 0,
    retweeted: [],
    retweet_count: 0,
  };
  Events.emitNet('dg-phone:client:newTweet', -1, { ...tweetCache[id], liked: false, retweeted: false });
  return id;
};

export const likeTweet = async (cid: number, tweetId: number) => {
  if (tweetCache[tweetId].liked.includes(cid)) return;
  tweetCache[tweetId].like_count = tweetCache[tweetId].like_count + 1;
  tweetCache[tweetId].liked.push(cid);
  await SQL.query(
    `
		INSERT INTO phone_tweets_likes (cid, tweetid)
		VALUES (?, ?);
	`,
    [cid, tweetId]
  );
  Events.emitNet('dg-phone:client:twitter:addLike', -1, tweetId);
};

export const removeTweetLike = async (cid: number, tweetId: number) => {
  if (!tweetCache[tweetId].liked.includes(cid)) return;
  tweetCache[tweetId].like_count = tweetCache[tweetId].like_count - 1;
  tweetCache[tweetId].liked = tweetCache[tweetId].liked.filter(id => id !== cid);
  await SQL.query(
    `
		DELETE FROM phone_tweets_likes
		WHERE cid = ? AND tweetid = ?;
	`,
    [cid, tweetId]
  );
  Events.emitNet('dg-phone:client:twitter:removeLike', -1, tweetId);
};

export const addRetweet = async (cid: number, tweetId: number) => {
  if (tweetCache[tweetId].retweeted.includes(cid)) return;
  tweetCache[tweetId].retweet_count = tweetCache[tweetId].retweet_count + 1;
  tweetCache[tweetId].retweeted.push(cid);
  await SQL.query(
    `
		INSERT INTO phone_tweets_retweets (cid, tweetid)
		VALUES (?, ?);
  `,
    [cid, tweetId]
  );
  Events.emitNet('dg-phone:client:twitter:addRetweet', -1, tweetId);
};

export const deleteTweet = async (cid: number, tweetId: number) => {
  delete tweetCache[tweetId];
  await SQL.query(
    `
		DELETE FROM phone_tweets
		WHERE id = ?;
  `,
    [tweetId]
  );
  Events.emitNet('dg-phone:client:twitter:deleteTweet', -1, tweetId);
};
