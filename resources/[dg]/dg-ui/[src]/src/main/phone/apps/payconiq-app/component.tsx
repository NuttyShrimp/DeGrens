import React from 'react';
import { compose, connect } from '@lib/redux';

import { devData } from '../../../../lib/devdata';
import { nuiAction } from '../../../../lib/nui-comms';

import { Payconiq } from './components/payconiq';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.PayConiq.Props, any> {
  async fetchList() {
    const trans = await nuiAction('phone/payconiq/get', {}, devData.bankTrans);
    this.props.updateState({
      list: trans,
    });
  }

  componentDidUpdate() {
    if (this.props.dirty) {
      this.fetchList();
      this.props.updateState({
        dirty: false,
      });
    }
  }

  componentDidMount() {
    this.fetchList();
  }

  render() {
    return <Payconiq {...this.props} />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
