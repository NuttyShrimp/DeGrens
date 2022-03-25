import React from 'react';
import { compose, connect } from '@lib/redux';

import { HomeScreen } from './components/homescreen';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<any, any> {
  render() {
    return <HomeScreen />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
