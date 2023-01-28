let hideTimeout: NodeJS.Timeout | null = null;

export const openChat = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  // Open chat + input
  SendNUIMessage({
    action: 'setInputVisibility',
    data: true,
  });
  SendNUIMessage({
    action: 'setMsgVisibility',
    data: true,
  });
  SetNuiFocus(true, false);
};

export const closeChat = () => {
  SetNuiFocus(false, false);
  SendNUIMessage({
    action: 'setInputVisibility',
    data: false,
  });
  hideTimeout = setTimeout(() => {
    SendNUIMessage({
      action: 'setMsgVisibility',
      data: false,
    });
  }, 5000);
};

export const forceClose = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  SetNuiFocus(false, false);
  SendNUIMessage({
    action: 'setInputVisibility',
    data: false,
  });
  SendNUIMessage({
    action: 'setMsgVisibility',
    data: false,
  });
};

export const peekChat = () => {
  // Open chat
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  SendNUIMessage({
    action: 'setMsgVisibility',
    data: true,
  });
  closeChat();
};
