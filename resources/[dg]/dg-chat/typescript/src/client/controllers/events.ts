import { Events, Keys } from '@dgx/client';
import { closeChat, forceClose, openChat, peekChat } from 'helpers/chat';

import { addOldMessage, addOldSuggestion, getOldSuggestions } from '../helpers/backwards';

Events.onNet('chat:registerCommands', (cmds: Shared.Command[]) => {
  SendNUIMessage({
    action: 'setSuggestions',
    data: cmds.concat(getOldSuggestions()),
  });
});

Events.onNet('chat:addNuiMessage', (msg: Shared.Message) => {
  peekChat();
  msg.type = msg.type ?? 'normal';
  SendNUIMessage({
    action: 'addMessage',
    data: msg,
  });
});

Events.onNet('executeLocalCmd', (cmdStr: string) => {
  ExecuteCommand(cmdStr);
});

Events.onNet('chat:clear', () => {
  SendNUIMessage({
    action: 'clearChat',
  });
});

Events.onNet('chat:restart', () => {
  closeChat();
  setTimeout(() => peekChat(), 500);
});

// This is for backwards compatibility
// I will crucify you if you use this
on('chat:addMessage', addOldMessage);

on('chat:addSuggestion', addOldSuggestion);

AddStateBagChangeHandler(
  'loggedIn',
  `player:${GetPlayerServerId(PlayerId())}`,
  (_: string, key: string, val: boolean) => {
    console.log(`statebag: ${key} changed to ${val}`);
    if (key !== 'loggedIn') return;
    SendNUIMessage({
      action: 'lockVisibility',
      data: !val,
    });
  }
);

RegisterNuiCallbackType('loaded');
on(`__cfx_nui:loaded`, (data: null, cb: Function) => {
  SendNUIMessage({
    action: 'lockVisibility',
    data: LocalPlayer.state?.loggedIn ?? false,
  });
  Events.emitNet('chat:requestRefresh');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

RegisterNuiCallbackType('sendMessage');
on(`__cfx_nui:sendMessage`, (data: { message: string }, cb: Function) => {
  Events.emitNet('chat:incomingMessage', data.message);
  closeChat();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

RegisterNuiCallbackType('close');
on(`__cfx_nui:close`, (data: null, cb: Function) => {
  closeChat();
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Keys.onPressDown('openChat', openChat);
Keys.onPressDown('peekChat', peekChat);
Keys.register('openChat', 'open chat venster w focus', 'T');
Keys.register('peekChat', 'open chat venster w/e focus', 'RETURN');

global.exports('closeChat', closeChat);
global.exports('forceClose', forceClose);
