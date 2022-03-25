import React from 'react';
import { compose, connect } from '@lib/redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { showFormModal } from '../../lib';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { TweetModal } from './components/modals';
import { Twitter } from './components/twitter';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Twitter.Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
  }

  // region Tweet actions
  toggleLike = (tweetId: number, isLiked: boolean) => {
    nuiAction(isLiked ? 'phone/twitter/removeLike' : 'phone/twitter/addLike', { tweetId });
    const newTweets = [...this.props.tweets];
    const index = newTweets.findIndex(tweet => tweet.id === tweetId);
    if (index !== -1) {
      newTweets[index].liked = !isLiked;
    }
    this.props.updateState({
      tweets: newTweets,
    });
  };
  doRetweet = (tweet: Phone.Twitter.Tweet) => {
    showFormModal(
      <TweetModal
        onAccept={() => {
          nuiAction('phone/twitter/addRetweet', { tweetId: tweet.id });
          const newTweets = [...this.props.tweets];
          const index = newTweets.findIndex(_tweet => _tweet.id === tweet.id);
          if (index !== -1) {
            this.props.tweets[index].retweeted = true;
          }
          this.props.updateState({
            tweets: newTweets,
          });
        }}
        text={`RT ${tweet.sender_name}: ${tweet.tweet}`}
      />
    );
  };
  doDelete = (tweetId: number) => {
    nuiAction('phone/twitter/deleteTweet', { tweetId });
  };
  // endregion

  fetchTweets = async () => {
    const newTweets = await nuiAction(
      'phone/twitter/getTweets',
      {
        recBatches: this.props.requestAmount,
      },
      devData.tweets
    );
    const tweets = [...this.props.tweets, ...newTweets.reverse()];
    this.setState({ list: tweets });
    this.props.updateState({ tweets, requestAmount: this.props.requestAmount + 1 });
  };

  componentDidMount() {
    this.fetchTweets();
  }

  componentWillUnmount() {
    this.props.updateState({ requestAmount: 0, tweets: [] });
  }

  render() {
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
        emptyList={this.props.tweets.length === 0}
      >
        <Twitter
          {...this.props}
          toggleLike={this.toggleLike}
          doRetweet={this.doRetweet}
          doDelete={this.doDelete}
          fetchTweets={this.fetchTweets}
        />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
