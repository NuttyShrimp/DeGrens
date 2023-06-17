import { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { TweetModal } from './components/modals';
import { Twitter } from './components/twitter';
import { useTwitterAppStore } from './stores/useTwitterAppStore';
const Component = () => {
  const [tweets, requestAmount, updateStore] = useTwitterAppStore(s => [s.tweets, s.requestAmount, s.updateStore]);
  // region Tweet actions
  const toggleLike = (tweetId: number, isLiked: boolean) => {
    nuiAction(isLiked ? 'phone/twitter/removeLike' : 'phone/twitter/addLike', { tweetId });
    const newTweets = [...tweets];
    const index = newTweets.findIndex(tweet => tweet.id === tweetId);
    if (index !== -1) {
      newTweets[index].liked = !isLiked;
    }
    updateStore({
      tweets: newTweets,
    });
  };
  const doRetweet = (tweet: Phone.Twitter.Tweet) => {
    showFormModal(
      <TweetModal
        onAccept={() => {
          nuiAction('phone/twitter/addRetweet', { tweetId: tweet.id });
          const newTweets = [...tweets];
          const index = newTweets.findIndex(_tweet => _tweet.id === tweet.id);
          if (index !== -1) {
            newTweets[index].retweeted = true;
          }
          updateStore({
            tweets: newTweets,
          });
        }}
        text={`RT ${tweet.sender_name}: ${tweet.tweet}`}
      />
    );
  };
  const doDelete = (tweetId: number) => {
    nuiAction('phone/twitter/deleteTweet', { tweetId });
  };
  // endregion

  const fetchTweets = async () => {
    const newTweets = await nuiAction<Phone.Twitter.Tweet[]>(
      'phone/twitter/getTweets',
      {
        recBatches: requestAmount,
      },
      devData.tweets
    );
    if (!newTweets || newTweets.length === 0) return;
    updateStore({
      tweets: [...tweets, ...newTweets.reverse()],
      requestAmount: requestAmount + 1,
    });
  };

  useEffect(() => {
    fetchTweets();
    return () => {
      updateStore({ requestAmount: 0, tweets: [] });
    };
  }, []);

  return (
    <AppContainer
      primaryActions={[
        {
          icon: 'twitter',
          iconLib: 'fab',
          title: 'Nieuwe tweet',
          onClick: () => {
            showFormModal(<TweetModal />);
          },
        },
      ]}
      emptyList={tweets.length === 0}
    >
      <Twitter toggleLike={toggleLike} doRetweet={doRetweet} doDelete={doDelete} fetchTweets={fetchTweets} />
    </AppContainer>
  );
};

export default Component;
