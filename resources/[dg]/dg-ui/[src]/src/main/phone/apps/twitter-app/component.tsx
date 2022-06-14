import React, { useEffect } from 'react';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { TweetModal } from './components/modals';
import { Twitter } from './components/twitter';
const Component: AppFunction<Phone.Twitter.State> = props => {
  // region Tweet actions
  const toggleLike = (tweetId: number, isLiked: boolean) => {
    nuiAction(isLiked ? 'phone/twitter/removeLike' : 'phone/twitter/addLike', { tweetId });
    const newTweets = [...props.tweets];
    const index = newTweets.findIndex(tweet => tweet.id === tweetId);
    if (index !== -1) {
      newTweets[index].liked = !isLiked;
    }
    props.updateState({
      tweets: newTweets,
    });
  };
  const doRetweet = (tweet: Phone.Twitter.Tweet) => {
    showFormModal(
      <TweetModal
        onAccept={() => {
          nuiAction('phone/twitter/addRetweet', { tweetId: tweet.id });
          const newTweets = [...props.tweets];
          const index = newTweets.findIndex(_tweet => _tweet.id === tweet.id);
          if (index !== -1) {
            props.tweets[index].retweeted = true;
          }
          props.updateState({
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
        recBatches: props.requestAmount,
      },
      devData.tweets
    );
    const tweets = [...props.tweets, ...newTweets.reverse()];
    props.updateState({ tweets, requestAmount: props.requestAmount + 1 });
  };

  useEffect(() => {
    fetchTweets();
    return () => {
      props.updateState({ requestAmount: 0, tweets: [] });
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
      emptyList={props.tweets.length === 0}
    >
      <Twitter {...props} toggleLike={toggleLike} doRetweet={doRetweet} doDelete={doDelete} fetchTweets={fetchTweets} />
    </AppContainer>
  );
};

export default Component;
