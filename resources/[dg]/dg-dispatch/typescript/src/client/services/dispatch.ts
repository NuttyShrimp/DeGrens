import { BlipManager, Events, Notifications, UI } from '@dgx/client';

let isDispatchOpen = false;
let lastCallId: string;
let flashThread: NodeJS.Timeout | null;
let dispatchNotificationsDisabled = false;

export const setDispatchOpen = (toggle: boolean) => {
  isDispatchOpen = toggle;
};

export const setLastCallId = (id: string) => {
  lastCallId = id;
};

export const getLastCallId = () => lastCallId;

export const flashNewCalls = () => {
  if (isDispatchOpen) return;
  if (flashThread) clearTimeout(flashThread);
  UI.openApplication(
    'dispatch',
    {
      onlyNew: true,
      hasCursor: false,
    },
    true
  );
  flashThread = setTimeout(() => {
    UI.closeApplication('dispatch');
  }, 5000);
};

export const clearFlashThread = () => {
  if (!flashThread) return;
  clearTimeout(flashThread);
  flashThread = null;
};

export const addCallBlip = (call: Dispatch.UICall) => {
  if (!call.blip) return;
  if (!call.coords) {
    console.error(`Dispatch call with title: ${call.title} needs coords to display blip`);
    return;
  }
  BlipManager.addBlip({
    category: 'dispatch',
    id: call.id,
    text: call.title,
    coords: call.coords,
    ...call.blip,
    scale: 1.5,
  });
  setTimeout(() => {
    BlipManager.removeBlip(call.id);
  }, 60000);
};

export const areDispatchNotificationsDisabled = () => dispatchNotificationsDisabled;

export const toggleDispatchNotifications = (toggle: boolean) => {
  dispatchNotificationsDisabled = toggle;

  if (dispatchNotificationsDisabled) {
    // remove all existing calls/blips
    UI.SendAppEvent('dispatch', {
      action: 'addCalls',
      calls: [],
      refresh: true,
    });
    BlipManager.disableCategory('dispatch');
  } else {
    Events.emitNet('dg-dispatch:loadMore', 0);
    BlipManager.enableCategory('dispatch');
  }

  Notifications.add(`Dispatch Notificaties ${toggle ? 'gedeactiveerd' : 'geactiveerd'}`);
};
