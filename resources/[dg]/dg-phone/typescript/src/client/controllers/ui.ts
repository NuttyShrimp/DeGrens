import { UI } from '@dgx/client';
import { closePhone } from 'services/mgmt';
import { setState } from 'services/state';

UI.RegisterUICallback('phone/close', (data, cb) => {
  if (data.inCamera) return;
  closePhone(0, true);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/silence', (data, cb) => {
  setState('isMuted', data.silenced);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('controls/setFocus', (data, cb) => {
  setState('inputFocused', data.state);
  cb({ data: {}, meta: { ok: true, message: 'ok' } });
});
