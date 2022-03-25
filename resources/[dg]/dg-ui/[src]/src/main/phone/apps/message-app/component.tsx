import React from 'react';
import { compose, connect } from '@lib/redux';

import { Conversation } from './components/conversation';
import { List } from './components/list';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Messages.Props, any> {
  componentWillUnmount() {
    this.props.updateState({
      currentNumber: null,
    });
  }

  render() {
    return this.props.currentNumber === null ? (
      <List list={this.props.messages} updateState={this.props.updateState} />
    ) : (
      <Conversation {...this.props} />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
