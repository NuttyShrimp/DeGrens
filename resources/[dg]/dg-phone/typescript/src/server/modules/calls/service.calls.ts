import { Core, Events, Inventory, Notifications } from '@dgx/server';
import { charModule } from 'helpers/core';
import { mainLogger } from 'sv_logger';

import { CallType } from '../../../shared/enums/callType';

const calls: Record<number, Calls.Call> = {};
const plyToCallId: Record<number, number> = {};
let callId = 1;

export const getCallIdForPly = (plyId: number) => {
  return plyToCallId[plyId];
};

const getLabelForCalltype = (ply: Core.Characters.Player, type: CallType) => {
  switch (type) {
    case CallType.NORMAL:
      return ply.charinfo.phone;
    case CallType.ANON:
      return 'UNKNOWN NUMBER';
    case CallType.PRISON:
      return 'BOLINGBROKE PENITENTIARY';
  }
};

export const startCall = async (plyId: number, phoneNr: string, type: CallType) => {
  const player = Core.getPlayer(plyId);
  if (!player) return;
  const hasPhone = await Inventory.doesPlayerHaveItems(plyId, 'phone');
  if (type == CallType.NORMAL && !hasPhone) {
    mainLogger.warn(`${player?.name} tried to call without a phone`);
    return;
  }

  if (phoneNr === player.charinfo.phone) {
    Notifications.add(plyId, 'Je kan jezelf niet bellen!', 'error');
    Events.emitNet('phone:calls:endCurrent', plyId, 0);
    return;
  }

  const targetPly = charModule.getPlayerByPhone(phoneNr);
  if (targetPly && getCallIdForPly(targetPly.serverId)) {
    Events.emitNet('phone:calls:endCurrent', plyId, 0);
    return;
  }

  const call: Calls.Call = {
    id: callId++,
    caller: plyId,
    target: targetPly?.serverId,
    state: 'outgoing',
    type,
  };

  calls[call.id] = call;
  plyToCallId[plyId] = call.id;
  if (targetPly) {
    plyToCallId[targetPly.serverId] = call.id;
    const label = getLabelForCalltype(player, type);
    Events.emitNet('phone:calls:incoming', targetPly.serverId, {
      label,
      type,
      soundId: call.id,
    });
  }

  setTimeout(() => {
    if (!calls[call.id] || calls[call.id].state !== 'outgoing') return;
    endCall(call.id);
  }, 10000);

  return call.id;
};

export const endCall = (callId: number) => {
  if (!calls[callId]) return;
  const call = calls[callId];

  call.state = 'ended';
  Events.emitNet('phone:calls:endCurrent', call.caller, callId);
  global.exports['pma-voice'].setPlayerCall(call.caller, 0);
  delete plyToCallId[call.caller];
  if (call.target) {
    Events.emitNet('phone:calls:endCurrent', call.target, callId);
    global.exports['pma-voice'].setPlayerCall(call.target, 0);
    delete plyToCallId[call.target];
  }
  delete calls[callId];
};

export const initiateCall = (callId: number) => {
  if (!calls[callId]) return;
  mainLogger.info(`Call ${callId} initiated`);
  calls[callId].state = 'established';
  Events.emitNet('phone:calls:initiate', calls[callId].caller, callId);
  Events.emitNet('phone:calls:initiate', calls[callId].target!, callId);
  global.exports['pma-voice'].setPlayerCall(calls[callId].caller, callId);
  global.exports['pma-voice'].setPlayerCall(calls[callId].target, callId);
};
