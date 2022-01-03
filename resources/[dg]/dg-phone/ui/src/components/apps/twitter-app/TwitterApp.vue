<template>
	<app-container :primary-actions="primaryActions">
		<div class="twitter-app">
			<div v-for="tweet in appState.tweets" :key="tweet.id" class="tweet">
				<div class="tweet--header">
					<p>{{ tweet.sender_name }}</p>
					<p>{{ formatRelativeTime(tweet.date) }}</p>
				</div>
				<div class="tweet--body">
					<Text>
						{{ tweet.tweet }}
					</Text>
				</div>
				<div class="tweet--btns">
					<div class="tweet--btns--like">
						<el-button
							v-if="tweet.liked"
							class="tweet--btns--liked"
							type="text"
							size="mini"
							@click="toggleLike(tweet.id, tweet.liked)"
							><i class="fas fa-heart"></i> {{ tweet.like_count }}
						</el-button>
						<el-button v-else type="text" size="mini" @click="toggleLike(tweet.id, tweet.liked)"
							><i class="far fa-heart"></i> {{ tweet.like_count }}
						</el-button>
					</div>
					<div class="tweet--btns--retweet">
						<el-button v-if="tweet.retweeted" class="tweet--btns--retweeted" type="text" size="mini"
							><i class="fas fa-retweet"></i> {{ tweet.retweet_count }}
						</el-button>
						<el-button v-else type="text" size="mini" @click="doRetweet(tweet)"
							><i class="fal fa-retweet"></i> {{ tweet.retweet_count }}
						</el-button>
					</div>
					<div v-if="characterState.permissionGroup !== 'user'" class="tweet--btns--delete">
						<el-button type="text" size="mini" @click="doDelete(tweet.id)"><i class="fal fa-trash-alt"></i> </el-button>
					</div>
				</div>
			</div>
		</div>
	</app-container>
</template>

<script lang="ts">
	import '@/styles/apps/pinger.scss';
	import { computed, defineComponent, onMounted } from 'vue';
	import { nuiAction } from '../../../lib/nui';
	import AppContainer from '../../os/AppContainer.vue';
	import { State, useStore } from '../../../lib/state';
	import { Action } from '../../../types/appcontainer';
	import { devdata } from '../../../lib/devdata';
	import { formatRelativeTime } from '../../../lib/util';
	import '@/styles/apps/twitter.scss';
	import { newTweetForm } from './components/TwitterModals.vue';
	import { Tweet } from '../../../types/apps';
	import Text from '../../os/Text.vue';

	export default defineComponent({
		name: 'TweetApp',
		components: { Text, AppContainer },
		setup() {
			const store = useStore();
			let appState = computed<State['twitter']>(() => store.getters.getAppState('twitter'));
			let characterState = computed<State['character']>(() => store.getters.getAppState('character'));
			const primaryActions: Action[] = [
				{
					icon: 'plus',
					label: 'New Tweet',
					handler: () => {
						store.dispatch('openModal', {
							element: newTweetForm,
							props: {},
						});
					},
				},
			];

			const toggleLike = (tweetId: number, isCurLiked: boolean) => {
				nuiAction(isCurLiked ? 'twitter/removeLike' : 'twitter/addLike', { tweetId });
				store.commit('likeTweet', { tweetId, liked: !isCurLiked });
			};

			const doRetweet = (tweet: Tweet) => {
				store.dispatch('openModal', {
					element: newTweetForm,
					props: {
						tweet: `RT ${tweet.sender_name}: ${tweet.tweet}`,
						onAccept: () => {
							nuiAction('twitter/addRetweet', { tweetId: tweet.id });
							store.commit('setTweetRetweeted', { tweetId: tweet.id });
						},
					},
				});
			};

			const doDelete = (tweetId: number) => {
				nuiAction('twitter/deleteTweet', { tweetId });
			};

			const fetchTweets = async () => {
				const _tweets = await nuiAction(
					'twitter/getTweets',
					{
						recBatches: appState.value.recBatches,
					},
					devdata.twitter.tweets
				);
				store.commit('addNewTweets', _tweets);
			};
			onMounted(fetchTweets);
			return {
				primaryActions,
				appState,
				characterState,
				formatRelativeTime,
				toggleLike,
				doRetweet,
				doDelete,
			};
		},
	});
</script>
