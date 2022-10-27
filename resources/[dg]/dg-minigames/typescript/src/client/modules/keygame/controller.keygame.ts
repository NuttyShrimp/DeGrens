import { UI } from '@dgx/client';
import { startKeygame, finishKeygame } from './service.keygame';

UI.RegisterUICallback('keygame/finished', (data: { id: string; success: boolean }, cb) => {
  finishKeygame(data.id, data.success);
  cb({ data, meta: { ok: true, message: 'done' } });
});

global.asyncExports('keygame', startKeygame);
