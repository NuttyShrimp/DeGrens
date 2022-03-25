import React from 'react';
import { compose, connect } from '@lib/redux';

import { Phone } from './components/phone';
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
    return <Phone />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
