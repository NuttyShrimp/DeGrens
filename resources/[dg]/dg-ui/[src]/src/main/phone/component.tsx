import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { Phone } from './os/phone/phone';
import { ConfigObject, getPhoneApps, phoneApps, phoneEvents } from './config';
import { clearHideTimeout, hidePhone, phoneInit, setBackground } from './lib';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: s => ({
    character: s.character,
    game: s.game,
  }),
  mapDispatchToProps: {},
});

class Component extends React.Component<Phone.Props, any> {
  config: ConfigObject[];

  constructor(props) {
    super(props);
    this.config = getPhoneApps();
  }

  handleShow = (data: Omit<typeof store.initialState, 'visible'>) => {
    clearHideTimeout();
    this.props.updateState({
      ...data,
      visible: true,
      animating: true,
    });
  };

  handleEvent = (pData: any) => {
    if (pData.action === 'init') {
      phoneInit();
      return;
    }
    const { appName, action, data } = pData;
    if (!phoneEvents?.[appName]?.[action]) {
      throw new Error(`Unknown Phone event: ${appName}/${action}`);
    }
    phoneEvents[appName][action](data);
  };

  componentDidMount() {
    if (phoneApps.length === 0) {
      this.config = getPhoneApps();
    }
    setBackground();
  }

  render() {
    return (
      <AppWrapper
        appName={store.key}
        onShow={this.handleShow}
        onEvent={this.handleEvent}
        onHide={hidePhone}
        onEscape={hidePhone}
        full
        hideOverflow
      >
        <Phone {...this.props} config={this.config} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
