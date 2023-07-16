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
    updateStore(s => ({
      tweets: s.tweets.map(t => ({
        ...t,
        liked: t.id === tweetId ? !isLiked : t.liked,
      })),
    }));
  };

  const doRetweet = (tweetId: number) => {
    nuiAction('phone/twitter/addRetweet', { tweetId });
    updateStore(s => ({
      tweets: s.tweets.map(t => ({
        ...t,
        retweeted: t.id === tweetId ? true : t.retweeted,
      })),
    }));
  };

  const doReply = (tweet: Phone.Twitter.Tweet) => {
    showFormModal(<TweetModal text={`${tweet.sender_name} `} />);
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
      <Twitter
        toggleLike={toggleLike}
        doRetweet={doRetweet}
        doDelete={doDelete}
        fetchTweets={fetchTweets}
        doReply={doReply}
      />
    </AppContainer>
  );
};

export default Component;
