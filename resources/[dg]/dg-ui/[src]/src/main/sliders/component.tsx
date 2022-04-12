import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { Sliders } from './components/sliders';
import store from './store';

import './styles/sliders.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Sliders.Props, any> {
  onShow = (data: { power: number[]; amount: number[] }) => {
    this.props.updateState({
      visible: true,
      power: data.power,
      amount: data.amount,
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
        <Sliders {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
