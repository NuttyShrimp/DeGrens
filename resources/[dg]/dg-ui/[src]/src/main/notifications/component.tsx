import React from 'react';
import AppWrapper from '@components/appwrapper';
import { compose, connect } from '@lib/redux';

import { sanitizeText } from '../../lib/util';

import { NotificationList } from './components/list';
import store from './store';

import './styles/notifications.scss';

const { mapStateToProps, mapDispatchToProps } = compose(store, {
  mapStateToProps: () => ({}),
  mapDispatchToProps: {},
});

class Component extends React.Component<Notifications.Props, any> {
  constructor(props) {
    super(props);
    this.state = {
      id: 0,
    };
  }

  types = ['success', 'info', 'error', 'primary'];

  handleVisibility = (visible: boolean) => {
    this.setState({ visible });
  };

  eventHandler = (data: any) => {
    switch (data.action) {
      case 'add': {
        if (!this.validateType(data.notification?.type || 'info')) {
          console.error('Invalid notification type', data.notification);
          return;
        }

        // Backwards compatibility
        if (data.notification?.type === 'primary') {
          data.notification.type = 'info';
        }

        const id = data.notification?.id ?? this.state.id;
        this.setState({ id: id + 1 });
        const notification: Notifications.Notification = {
          id,
          message: sanitizeText(data.notification.message),
          type: data.notification?.type ?? 'info',
          timeout: data.notification?.timeout ?? 5000,
          persistent: data.notification.persistent ?? false,
        };
        this.props.updateState({
          notifications: [...this.props.notifications, notification],
        });
        if (notification.persistent) return id;
        setTimeout(() => {
          this.props.updateState({
            notifications: this.props.notifications.filter(n => n.id !== id),
          });
        }, notification.timeout);
        break;
      }
      case 'remove': {
        this.props.updateState({
          notifications: this.props.notifications.filter(n => n.id !== data.id),
        });
        break;
      }
      default: {
        throw new Error(`Unknown event for notification: ${data.action} | data: ${JSON.stringify(data)}`);
      }
    }
  };

  validateType = (notiType: string) => {
    return this.types.includes(notiType);
  };

  render() {
    return (
      <AppWrapper
        appName={store.key}
        onShow={() => this.handleVisibility(true)}
        onHide={() => this.handleVisibility(false)}
        onEvent={this.eventHandler}
        center
        unSelectable
      >
        <NotificationList {...this.props} />
      </AppWrapper>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
