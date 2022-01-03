import { store } from '../../../lib/state';
import { Tweet } from '../../../types/apps';

export const events: any = {};

events.newTweet = (tweet: Tweet) => {
	store.dispatch('addTweet', tweet);
};

events.addLike = (tweetId: number) => {
	store.commit('updateTweetStatus', {
		tweetId: tweetId,
		action: 'addLike',
	});
};

events.removeLike = (tweetId: number) => {
	store.commit('updateTweetStatus', {
		tweetId: tweetId,
		action: 'removeLike',
	});
};

events.addRetweet = (tweetId: number) => {
	store.commit('updateTweetStatus', {
		tweetId: tweetId,
		action: 'addRetweet',
	});
};

events.deleteTweet = (tweetId: number) => {
	store.commit({
		type: 'deleteTweet',
		payload: tweetId,
	});
};
