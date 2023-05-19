import { Events, Keys, RPC, UI } from '@dgx/client';
import { startThread, stopThread } from './service.camera';
import { closePhone } from 'services/mgmt';
import { getState } from 'services/state';

UI.RegisterUICallback('phone/camera/open', (data, cb) => {
  closePhone(2);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/gallery/get', async (data, cb) => {
  const images = await RPC.execute('phone:camera:get');
  cb({ data: images, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/gallery/delete', (data, cb) => {
  Events.emitNet('phone:camera:delete', data.id);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

export const startCameraThread = () => {
  startThread();
};

export const abortCameraThread = () => {
  stopThread();
};
