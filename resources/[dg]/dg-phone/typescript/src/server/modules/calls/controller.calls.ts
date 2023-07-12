import { RPC } from '@dgx/server';

import { endCall, getCallIdForPly, initiateCall, startCall } from './service.calls';

RPC.register('phone:calls:start', (plyId, data: { phone: string; type: Calls.CallType }) => {
  if (!data.phone) return;
  return startCall(plyId, data.phone, data.type);
});

RPC.register('phone:calls:end', src => {
  const _callId = getCallIdForPly(src);
  if (!_callId) return;
  endCall(_callId);
});

RPC.register('phone:calls:initiate', src => {
  const _callId = getCallIdForPly(src);
  if (!_callId) return;
  initiateCall(_callId);
});
