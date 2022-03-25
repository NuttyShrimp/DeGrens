import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { Scenes } from './components/scenes';
import store from './store';

import './styles/scenes.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Scenes.Props, any> {
  onShow = () => {
    this.props.updateState({
      visible: true,
    });
  };

  onHide = () => {
    this.props.updateState({
      visible: false,
    });
  };

  render() {
    return (
      <AppWrapper appName={store.key} onShow={this.onShow} onHide={this.onHide} onEscape={this.onHide} full center>
        <Scenes {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
