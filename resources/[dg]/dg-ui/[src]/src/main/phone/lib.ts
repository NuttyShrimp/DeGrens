import baseBackground from '@assets/phone/background.png';
import { useMainStore } from '@src/lib/stores/useMainStore';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import { Loader } from '../../components/util';
import { nuiAction } from '../../lib/nui-comms';
import { useConfigmenuStore } from '../configmenu/stores/useConfigmenuStore';

import { usePhoneFormStore } from './stores/usePhoneFormStore';
import { usePhoneNotiStore } from './stores/usePhoneNotiStore';
import { usePhoneStore } from './stores/usePhoneStore';
import { getPhoneApp, getPhoneApps, phoneApps } from './config';

export const hidePhone = () => {
  const state = usePhoneStore.getState();
  usePhoneStore.setState({
    animating: state.hasNotifications ? 'peek' : 'closed',
  });
  setTimeout(() => {
    if (state.hasNotifications) return;
    useVisibleStore.getState().toggleApp('phone', false);
  }, 500);
  nuiAction('phone/close', { inCamera: state.inCamera });
  usePhoneStore.setState({
    inCamera: false,
  });
};

export const phoneInit = () => {
  for (const app of getPhoneApps()) {
    if (app.init) {
      app.init();
    }
  }
};

export const setBackground = () => {
  const activeApp = usePhoneStore.getState().activeApp;
  const currentAppInfo = phoneApps.find(app => app.name === activeApp);
  const getStandardBackground = () => {
    const charBG = useConfigmenuStore.getState().phone?.background?.phone;
    return {
      backgroundImage: `url(${(charBG && charBG.trim() !== '' ? charBG : baseBackground) || baseBackground}`,
    };
  };
  if (!currentAppInfo || !currentAppInfo?.background) {
    usePhoneStore.setState({
      background: getStandardBackground(),
    });
    return;
  }
  const newBackground =
    currentAppInfo?.background === 'transparent'
      ? getStandardBackground()
      : typeof currentAppInfo?.background === 'string'
      ? { background: currentAppInfo?.background }
      : currentAppInfo?.background;
  usePhoneStore.setState({
    background: newBackground,
  });
};

export const changeApp = (app: string) => {
  if (!phoneApps.find(a => a.name === app)) {
    console.error(`Phone app ${app} not found`);
  }
  usePhoneStore.setState(s => ({
    activeApp: app,
    appNotifications: s.appNotifications.filter(a => a !== app),
  }));
  setBackground();
};

export const isAppActive = (app: string) => usePhoneStore.getState().activeApp === app;

export const showFormModal = (Form: any) => {
  usePhoneFormStore.setState({
    visible: true,
    element: Form,
    checkmark: false,
    warning: false,
  });
};

export const hideFormModal = () => {
  usePhoneFormStore.setState({
    visible: false,
    checkmark: false,
    warning: false,
    element: null,
  });
};

export const showLoadModal = () => {
  showFormModal(Loader({}));
};

export const showCheckmarkModal = (payload?: Function) => {
  usePhoneFormStore.setState({
    visible: false,
    checkmark: true,
    element: null,
    warning: false,
  });
  setTimeout(() => {
    hideFormModal();
    if (!payload) return;
    payload();
  }, 2000);
};

export const showWarningModal = (payload?: Function) => {
  usePhoneFormStore.setState({
    visible: false,
    checkmark: false,
    element: null,
    warning: true,
  });
  setTimeout(() => {
    hideFormModal();
    if (!payload) return;
    payload();
  }, 2000);
};

// region notifications
const stringEvents = ['onAccept', 'onDecline'];

export const addNotification = (
  notification: Omit<Phone.Notifications.Notification, 'icon'> & { icon: string | Phone.Notifications.Icon }
) => {
  const charState = useMainStore.getState().character;
  if (!charState.hasPhone) {
    return;
  }
  // Prevent duplicate notifications
  removeNotification(notification.id);
  // Kan naam vam app zijn of FA icon met defaults
  if (typeof notification.icon === 'string') {
    const app = phoneApps.find(app => app.name === notification.icon);

    if (app) {
      notification.icon = app.icon as Phone.Notifications.Icon;
    } else {
      notification.icon = {
        name: notification.icon,
        color: 'white',
        background: 'black',
      };
    }
  }
  stringEvents.forEach(e => {
    if (typeof notification[e] === 'string') {
      const eventName = notification[e];
      notification[e] = (_data: any) => {
        nuiAction('phone/notifications/event', {
          event: eventName,
          isAccept: e === 'onAccept',
          data: _data,
        });
      };
    }
  });
  if (notification.app && !getPhoneApp(notification.app)) {
    throw new Error(`Phone app ${notification.app} not found (notification: ${notification.id})`);
  }
  const notiState = usePhoneNotiStore.getState();
  notiState.list.unshift(notification as Phone.Notifications.Notification);
  usePhoneNotiStore.setState({
    list: notiState.list,
  });
  const phoneState = usePhoneStore.getState();
  if (!phoneState.isSilent) {
    useVisibleStore.getState().toggleApp('phone', true);
    usePhoneStore.setState({
      animating: phoneState.animating !== 'open' ? 'peek' : 'open',
      hasNotifications: true,
    });
  }
  if (notification.sticky) return;
  let cd = notification?.timer && notification.timer > 0 ? notification.timer * 1000 : 8000;
  if ((notification.onAccept || notification.onDecline) && !((notification?.timer ?? 0) > 0)) {
    cd = 30000;
  }
  setTimeout(() => {
    removeNotification(notification.id);
    if (notification?.onDecline) {
      (notification.onDecline as Function)(notification._data);
    }
  }, cd);
};

export const removeNotification = (id: string) => {
  const notiState = usePhoneNotiStore.getState();
  const index = notiState.list.findIndex(n => n.id === id);
  if (index === -1) return;
  notiState.list.splice(index, 1);
  usePhoneNotiStore.setState({
    list: notiState.list,
  });
  const phoneState = usePhoneStore.getState();
  if (notiState.list.length === 0) {
    usePhoneStore.setState({
      animating: phoneState.animating === 'peek' ? 'closed' : 'open',
      hasNotifications: false,
    });
  }
};

export const acceptNotification = (id: string) => {
  const notiState = usePhoneNotiStore.getState();
  const notification = notiState.list.find(n => n.id === id);
  if (!notification) return;
  if (notification.onAccept) {
    (notification.onAccept as Function)(notification._data);
  }
  if (notification.app) {
    changeApp(notification.app);
  }
  if (notification.keepOnAction) return;
  removeNotification(id);
};

export const declineNotification = (id: string) => {
  const notiState = usePhoneNotiStore.getState();
  const notification = notiState.list.find(n => n.id === id);
  if (!notification) return;
  if (notification.onDecline) {
    (notification.onDecline as Function)(notification._data);
  }
  if (notification.keepOnAction) return;
  removeNotification(id);
};

export const updateNotification = (id: string, notification: Partial<Phone.Notifications.Notification>) => {
  const notiState = usePhoneNotiStore.getState();
  const index = notiState.list.findIndex(n => n.id === id);
  if (index === -1) return;
  notiState.list[index] = {
    ...notiState.list[index],
    ...notification,
  };
  usePhoneNotiStore.setState({
    list: notiState.list,
  });
};
// endregion

export const setBigPhoto = (url: string | null) => {
  usePhoneStore.setState({
    bigPhoto: url,
  });
};
