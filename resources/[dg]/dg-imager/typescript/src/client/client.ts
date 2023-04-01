import { Events } from '@dgx/client';

let correlationId = 0;
const pendingResultCBs: Record<string, (resultData: string) => void> = {};

const takeCorrelation = (cb: (resultData: string) => void) => {
  const id = correlationId.toString();
  correlationId++;
  pendingResultCBs[id] = cb;
  return id;
};

const screenshotRequest = (data: UploadRequest, cb?: (resultData: string) => void) => {
  if (cb) {
    data.correlation = takeCorrelation(cb);
    data.resultURL = `http://${GetCurrentResourceName()}/screenshot_created`;
  }

  SendNUIMessage({
    request: data,
  });
};

Events.onNet('dg-imager:requestImgurScreenshot', (cbTkn: string, data: UploadRequest) => {
  screenshotRequest(data, rData => {
    Events.emitNet('dg-imager:finishImgureScreenshot', cbTkn, rData);
  });
});

Events.onNet('dg-imager:requestMinioScreenshot', (data: UploadRequest) => {
  data.targetURL = `http://${GetCurrentServerEndpoint()}${data.targetURL}`;
  screenshotRequest(data);
});

RegisterNuiCallback('screenshot_created', (body: any, cb: (arg: any) => void) => {
  cb(true);

  if (body?.id !== undefined && pendingResultCBs[body.id]) {
    pendingResultCBs[body.id](body.data);
    delete pendingResultCBs[body.id];
  }
});
