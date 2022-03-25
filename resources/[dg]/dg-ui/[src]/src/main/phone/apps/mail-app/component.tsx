import React from 'react';
import { compose, connect } from '@lib/redux';

import { AppContainer } from '../../os/appcontainer/appcontainer';

import { Mail } from './components/mail';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Mail.Props, any> {
  render() {
    return (
      <AppContainer emptyList={this.props.mails.length === 0}>
        <Mail {...this.props} />
      </AppContainer>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
