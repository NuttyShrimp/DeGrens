import baseBackground from '@assets/phone/background.png';
import { closeApplication } from '@src/components/appwrapper';
import { useMainStore } from '@src/lib/stores/useMainStore';
import { useVisibleStore } from '@src/lib/stores/useVisibleStore';

import { Loader } from '../../components/util';
import { nuiAction } from '../../lib/nui-comms';
import { useConfigmenuStore } from '../configmenu/stores/useConfigmenuStore';

import { usePhoneFormStore } from './stores/usePhoneFormStore';
import { usePhoneNotiStore } from './stores/usePhoneNotiStore';
import { usePhoneStore } from './stores/usePhoneStore';
import { getPhoneApp, getPhoneApps, phoneApps } from './config';

const notificationTimers: Record<string, NodeJS.Timer> = {};

export const hidePhone = () => {
  const state = usePhoneStore.getState();
  usePhoneStore.setState({
    animating: state.hasNotifications ? 'peek' : 'closed',
    bigPhoto: null,
  });
  setTimeout(() => {
    if (state.hasNotifications) return;
    // making sure it is closed
    usePhoneStore.setState({
      animating: 'closed',
    });
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

export const showWarningModal = (payload?: Function, message?: string) => {
  usePhoneFormStore.setState({
    visible: false,
    checkmark: false,
    element: null,
    warning: message ?? true,
  });
  setTimeout(() => {
    hideFormModal();
    if (!payload) return;
    payload();
  }, 2000);
};

// region notifications
const stringEvents = ['onAccept', 'onDecline'];

const sortNotification = (s1: Phone.Notifications.Notification, s2: Phone.Notifications.Notification) => {
  if (s1.sticky && !s2.sticky) {
    return -1;
  } else if (!s1.sticky && s2.sticky) {
    return 1;
  }
  if (s1.timer !== undefined && s2.timer === undefined) {
    return -1;
  } else if (s1.timer === undefined && s2.timer !== undefined) {
    return 1;
  }
  return 0;
};

export const addNotification = (
  notification: Omit<Phone.Notifications.Notification, 'icon'> & { icon: string | Phone.Notifications.Icon }
) => {
  if (!notification.skipHasPhoneCheck) {
    const charState = useMainStore.getState().character;
    if (!charState.hasPhone) {
      return;
    }
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

  usePhoneNotiStore.setState(s => ({
    list: [...s.list, notification as Phone.Notifications.Notification].sort(sortNotification),
  }));
  const phoneState = usePhoneStore.getState();
  if (!phoneState.isSilent || notification.sticky) {
    useVisibleStore.getState().toggleApp('phone', true);
    usePhoneStore.setState({
      animating: phoneState.animating === 'open' ? 'open' : 'peek',
      hasNotifications: true,
    });
  }

  initNotificationTimerLogic(notification);
};

export const removeNotification = (id: string) => {
  const { list: oldList, timers: oldTimers } = usePhoneNotiStore.getState();
  if (!oldList.some(n => n.id === id)) return;

  if (notificationTimers[id]) {
    clearInterval(notificationTimers[id]);
    delete notificationTimers[id];
  }

  const newList = oldList.filter(n => n.id !== id).sort(sortNotification);
  delete oldTimers[id];
  usePhoneNotiStore.setState({
    list: newList,
    timers: oldTimers,
  });

  // only close app when phone is not open
  if (newList.length === 0) {
    let phoneIsOpen = false;
    usePhoneStore.setState(s => {
      if (s.animating === 'open') {
        phoneIsOpen = true;
      }
      return {
        hasNotifications: false,
      };
    });

    // only close phone when its animating state was not 'open'
    if (!phoneIsOpen) {
      closeApplication('phone');
    }
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
  const notificationList = [...usePhoneNotiStore.getState().list];
  const index = notificationList.findIndex(n => n.id === id);
  if (index === -1) return;

  notificationList[index] = {
    ...notificationList[index],
    ...notification,
  };
  usePhoneNotiStore.setState({
    list: notificationList.sort(sortNotification),
  });

  if (notification.timer !== undefined) {
    initNotificationTimerLogic(notificationList[index]);
  }
};

const initNotificationTimerLogic = (
  notification: Omit<Phone.Notifications.Notification, 'icon'> & { icon: string | Phone.Notifications.Icon }
) => {
  if (notification.timer !== undefined) {
    startNotificationTimer(notification.id, notification.timer);
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

const startNotificationTimer = (id: string, timer: number) => {
  if (timer > 0) {
    let time = Number(timer);
    usePhoneNotiStore.setState(s => ({
      timers: { ...s.timers, [id]: time },
    }));
    notificationTimers[id] = setInterval(() => {
      usePhoneNotiStore.setState(s => ({
        timers: { ...s.timers, [id]: --time },
      }));
    }, 1000);
  } else {
    let time = 0;
    usePhoneNotiStore.setState(s => ({
      timers: { ...s.timers, [id]: ++time },
    }));
    notificationTimers[id] = setInterval(() => {
      usePhoneNotiStore.setState(s => ({
        timers: { ...s.timers, [id]: ++time },
      }));
    }, 1000);
  }
};
// endregion

export const setBigPhoto = (url: string | null) => {
  usePhoneStore.setState({
    bigPhoto: url,
  });
};
