let hideTimeout: NodeJS.Timeout = null;

export const openChat = () => {
  clearTimeout(hideTimeout);
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
  clearTimeout(hideTimeout);
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
  clearTimeout(hideTimeout);
  SendNUIMessage({
    action: 'setMsgVisibility',
    data: true,
  });
  closeChat();
};
