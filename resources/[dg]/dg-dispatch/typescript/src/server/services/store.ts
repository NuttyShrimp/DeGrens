import { Util } from '@dgx/server';

import { prepareCall } from './dispatch';

// Store call on Id to make access to specific calls easier.
// Generation of ids is faster because it doesn't need to search in the object.
// The array of ids is used for the order te call came through, New calls will be at the end of the array
const callStore: Map<string, Dispatch.Call> = new Map();
const callIds: string[] = [];

const generateCallId = () => {
  let id = Util.uuidv4();
  while (callStore.has(id)) {
    id = Util.uuidv4();
  }
  return id;
};

export const addCall = (call: Dispatch.Call) => {
  const callId = generateCallId();
  callStore.set(callId, call);
  callIds.push(callId);
  return {
    ...call,
    id: callId,
  };
};

export const getCall = (id: string) => {
  return callStore.get(id);
};

export const getCalls = (offset: number) => {
  const startIdx = (offset + 20) * -1;
  const ids = offset > 0 ? callIds.slice(startIdx, offset * -1) : callIds.slice(startIdx);
  const calls: Dispatch.UICall[] = [];
  ids.forEach(id => {
    const call = callStore.get(id);
    if (!call) return;
    calls.push(prepareCall(id, call));
  });
  return calls;
};
