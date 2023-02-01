const doRequest = async (action: string, body = {}) => {
  // @ts-ignore
  const rawResult = await fetch(`https://${import.meta.env.PROD ? GetParentResourceName() : 'dev-env'}/${action}`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(body),
  });
  try {
    return await rawResult.json();
  } catch (err: any) {
    return { data: {}, meta: { ok: false, message: `Failed to do request for: ${action} - ${err.message}` } };
  }
};

export const nuiAction: <T>(event: string, body?: {}, devData?: any) => Promise<T> = async (
  event: string,
  body = {},
  devData: any = {}
) => {
  if (process.env.NODE_ENV === 'development') return devData;
  const request = await doRequest(event, body);
  if (!request?.meta?.ok) {
    throw new Error(request.meta.message);
  }
  return request.data;
};

export const emulate = (action: string, data = null) => {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        action,
        data,
      },
    })
  );
};
