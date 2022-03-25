import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { LogList } from './components/Log';
import store from './store';

import './styles/debuglogs.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<any, any> {
  handleVisibility = (isVis: boolean) => {
    this.props.updateState({
      visible: isVis,
    });
  };

  render() {
    return (
      <AppWrapper
        appName={store.key}
        onShow={() => this.handleVisibility(true)}
        onHide={() => this.handleVisibility(false)}
      >
        <LogList {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
