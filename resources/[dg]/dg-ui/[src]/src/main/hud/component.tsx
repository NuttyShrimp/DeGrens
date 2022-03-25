import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { isDevel } from '../../lib/env';

import { HudWrapper } from './components/hud';
import store from './store';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Hud.Props, any> {
  handleDevShow = (data: any) => {
    this.props.updateState({
      visible: true,
      values: {
        ...this.props.values,
        ...data.values,
      },
      compass: {
        ...this.props.compass,
        ...data.compass,
      },
      voice: {
        ...this.props.voice,
        ...data.voice,
      },
    });
  };

  handleVisibilityChange = (state: boolean) => {
    this.props.updateState({
      visible: state,
    });
  };

  handleEvent = (data: any) => {
    switch (data.action) {
      case 'toggleIcons': {
        const indents = Math.floor((Object.keys(this.getEnabledCircles()).length - 2) / 4);
        this.props.updateState({
          iconIdx: (this.props.iconIdx + 1) % indents,
        });
        break;
      }
      case 'setHudValues': {
        this.props.updateState({
          values: {
            ...this.props.values,
            ...data.values,
          },
          voice: {
            ...this.props.voice,
            ...data.voice,
          },
        });
        break;
      }
      default:
        break;
    }
  };

  getEnabledCircles = () => {
    const enabledCircles: Partial<Record<Hud.HudType, Hud.HudValue>> = {};
    Object.keys(this.props.values).forEach(key => {
      if (this.props.values[key].enabled) {
        enabledCircles[key] = this.props.values[key];
      }
    });
    return enabledCircles;
  };

  render() {
    return (
      <AppWrapper
        appName={store.key}
        onShow={isDevel() ? this.handleDevShow : () => this.handleVisibilityChange(true)}
        onHide={() => this.handleVisibilityChange(false)}
        onEvent={this.handleEvent}
        full
        unSelectable
      >
        <HudWrapper {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
