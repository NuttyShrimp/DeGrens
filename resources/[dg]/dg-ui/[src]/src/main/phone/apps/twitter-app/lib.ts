import { useTwitterAppStore } from './stores/useTwitterAppStore';

export const changeTweetStatus = (tweetId: number, action: string) => {
  const appState = useTwitterAppStore.getState();
  const tweets: Phone.Twitter.Tweet[] = [...appState.tweets];
  const index = tweets.findIndex(tweet => tweet.id === tweetId);
  if (index !== -1) {
    switch (action) {
      case 'addLike': {
        tweets[index].like_count++;
        break;
      }
      case 'removeLike': {
        tweets[index].like_count--;
        break;
      }
      case 'addRetweet': {
        tweets[index].retweet_count++;
        break;
      }
      default: {
        break;
      }
    }
    useTwitterAppStore.setState({ tweets });
  } else {
    console.warn(`couldn't find tweet with id: ${tweetId}`);
  }
};
