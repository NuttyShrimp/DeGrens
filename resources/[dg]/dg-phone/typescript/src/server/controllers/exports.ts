import { Events } from '@dgx/server';

// Close phone and hang up call when ply dies
global.exports('brickPhone', (plyId: number) => {
  Events.emitNet('dg-phone:client:togglePhone', plyId, false);
  // TODO: re-add when calling is ported
  // const callId = getPlayerCallId(plyId);
  // if (callId) endCall(callId);
});
