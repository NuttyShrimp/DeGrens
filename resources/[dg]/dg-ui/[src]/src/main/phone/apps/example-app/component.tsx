import React from 'react';
import { compose, connect } from '@lib/redux';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<any, any> {
  render() {
    return (
      <AppContainer>
        <span>Example app</span>
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
