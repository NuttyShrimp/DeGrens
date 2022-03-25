import baseBackground from '@assets/phone/background.png';

import { nuiAction } from '../../lib/nui-comms';
import { store, type } from '../../lib/redux';

import { getPhoneApp, getPhoneApps, phoneApps } from './config';

const baseBgURL = `url(${baseBackground})`;
export const getState: <T = Phone.State>(key?: string) => T = (key = 'phone') => store.getState()[key];

export const genericAction = (storeKey: string, data: any) => {
  store.dispatch({
    type,
    cb: state => ({
      ...state,
      [storeKey]: {
        ...state[storeKey],
        ...data,
      },
    }),
  });
};

export const hidePhone = () => {
  const state = getState();
  genericAction('phone', {
    animating: false,
  });
  setTimeout(() => {
    if (state.hasNotifications) return;
    genericAction('phone', {
      visible: false,
    });
  }, 300);
  nuiAction('phone/close', { inCamera: state.inCamera });
  genericAction('phone', {
    inCamera: false,
  });
};

export const phoneInit = async () => {
  const results: { app: string; result: any }[] = [];
  for (const app of getPhoneApps()) {
    if (app.init) {
      results.push({
        app: app.name,
        result: await app.init(),
      });
    }
  }
  results.map(({ app, result }) => {
    genericAction(`phone.apps.${app}`, result);
  });
};

export const setBackground = () => {
  const currentAppInfo = phoneApps.find(app => app.name === getState().activeApp);
  const getStandardBackground = () => {
    // TODO: Add getter for ply background from configmenu
    // const charBG = state.character.background;
    // return {
    // 	background: (charBG && charBG.trim() !== '' ? state.character.background : baseBgURL) || baseBgURL,
    // };
    return {
      background: baseBgURL,
    };
  };
  if (!currentAppInfo || !currentAppInfo?.background) {
    genericAction('phone', {
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
  genericAction('phone', {
    background: newBackground,
  });
};

export const changeApp = (app: string) => {
  if (!phoneApps.find(a => a.name === app)) {
    console.error(`Phone app ${app} not found`);
  }
  genericAction('phone', {
    activeApp: app,
  });
  setBackground();
};

export const showFormModal = (Form: any) => {
  genericAction('phone.form', {
    visible: true,
    element: Form,
    checkmark: false,
  });
};

export const hideFormModal = () => {
  genericAction('phone.form', {
    visible: false,
    checkmark: false,
    element: null,
  });
};

export const showCheckmarkModal = (payload?: Function) => {
  genericAction('phone.form', {
    visible: false,
    checkmark: true,
    element: null,
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
  const notiState = getState<Phone.Notifications.State>('phone.notifications');
  notiState.list.unshift(notification as Phone.Notifications.Notification);
  genericAction('phone.notifications', {
    list: notiState.list,
  });
  const phoneState = getState();
  if (!phoneState.isSilent) {
    genericAction('phone', {
      visible: true,
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
  const notiState = getState<Phone.Notifications.State>('phone.notifications');
  const index = notiState.list.findIndex(n => n.id === id);
  if (index === -1) return;
  notiState.list.splice(index, 1);
  genericAction('phone.notifications', {
    list: notiState.list,
  });
  if (notiState.list.length === 0) {
    genericAction('phone', {
      hasNotifications: false,
    });
  }
};

export const acceptNotification = (id: string) => {
  const notiState = getState<Phone.Notifications.State>('phone.notifications');
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
  const notiState = getState<Phone.Notifications.State>('phone.notifications');
  const notification = notiState.list.find(n => n.id === id);
  if (!notification) return;
  if (notification.onDecline) {
    (notification.onDecline as Function)(notification._data);
  }
  if (notification.keepOnAction) return;
  removeNotification(id);
};

export const updateNotification = (id: string, notification: Partial<Phone.Notifications.Notification>) => {
  const notiState = getState<Phone.Notifications.State>('phone.notifications');
  const index = notiState.list.findIndex(n => n.id === id);
  if (index === -1) return;
  notiState.list[index] = {
    ...notiState.list[index],
    ...notification,
  };
  genericAction('phone.notifications', {
    list: notiState.list,
  });
};
// endregion

export const setBigPhoto = (url: string | null) => {
  genericAction('phone', {
    bigPhoto: url,
  });
};
