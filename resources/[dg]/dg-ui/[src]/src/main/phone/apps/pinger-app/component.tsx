import React from 'react';
import { compose, connect } from '@lib/redux';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Pinger } from './components/pinger';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Messages.Props, any> {
  render() {
    return (
      <AppContainer>
        <Pinger />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
