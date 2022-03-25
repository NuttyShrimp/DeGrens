import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { Bar } from './components/bar';
import store from './store';

import './styles/cli.scss';

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
        center
      >
        <Bar {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
