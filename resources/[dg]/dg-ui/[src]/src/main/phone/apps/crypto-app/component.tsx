import React from 'react';
import { compose, connect } from '@lib/redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';
import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Crypto } from './components/crypto';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Crypto.Props, any> {
  async loadCoins() {
    this.props.updateState({
      list: [],
    });
    const coins: Phone.Crypto.Coin[] = await nuiAction('phone/crypto/get', {}, devData.crypto);
    this.props.updateState({
      list: coins,
    });
  }

  componentDidMount() {
    this.loadCoins();
  }

  componentDidUpdate() {
    if (this.props.shouldRenew) {
      this.loadCoins();
      this.props.updateState({
        shouldRenew: false,
      });
    }
  }

  render() {
    return (
      <AppContainer emptyList={this.props.list.length === 0}>
        <Crypto {...this.props} />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
