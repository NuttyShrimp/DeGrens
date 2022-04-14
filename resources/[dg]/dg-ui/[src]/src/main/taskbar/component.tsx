import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { TaskBar } from './component/TaskBar';
import store from './store';

import './styles/taskbar.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<TaskBar.Props, any> {
  showInput = (data: Partial<TaskBar.Props>) => {
    data.duration = Number(data.duration);
    this.props.updateState({
      visible: true,
      ...data,
    });
  };

  hideInput = () => {
    this.props.updateState({
      visible: false,
    });
  };

  handleEvent = data => {
    if (data.action === 'cancel') {
      this.props.updateState({
        duration: 1000,
        label: 'Geannuleerd',
      });
    }
  };

  render() {
    return (
      <AppWrapper
        appName={store.key}
        onShow={this.showInput}
        onHide={this.hideInput}
        onEvent={this.handleEvent}
        full
        center
      >
        <TaskBar {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
