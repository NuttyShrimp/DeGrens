import { addLog, finishLog } from '@main/debuglogs/lib';

import { useMainStore } from './stores/useMainStore';

const doRequest = async (action: string, body = {}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const rawResult = await fetch(`https://${GetParentResourceName()}/${action}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(body),
  });
  try {
    const result = await rawResult.json();
    return result;
  } catch (err: any) {
    return { data: {}, meta: { ok: false, message: `Failed to do request for: ${action} - ${err.message}` } };
  }
};

export const nuiAction: <T = any>(action: string, body?: Object, devData?: Object) => Promise<T> = async (
  action,
  body = {},
  devData
) => {
  body = { ...body, _character: useMainStore.getState().character };
  const actionId = addLog({
    name: action,
    body,
  });
  if (import.meta.env.VITE_ENV === 'development') {
    const _data = devData ?? undefined;
    finishLog(actionId, {
      response: _data ?? {},
      isOk: true,
    });
    return _data;
  }
  const request = await doRequest(action, body);
  if (!request?.meta?.ok) {
    // TODO add state setter for notification
    throw new Error(request.meta.message);
  }
  finishLog(actionId, {
    response: request ?? {},
    isOk: request?.meta?.ok ?? false,
  });
  return request.data;
};

export const mockEvent = (app: string, data: any, extraData = {}) => {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        app,
        data,
        ...extraData,
      },
    })
  );
};
