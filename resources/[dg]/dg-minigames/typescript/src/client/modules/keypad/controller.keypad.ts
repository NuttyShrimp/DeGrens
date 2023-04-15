import { UI } from '@dgx/client';
import { finishKeypad, forceFinishKeypad, openKeypad } from './service.keypad';

UI.RegisterUICallback('keypad/finish', (data: { id: string; inputs: string[] }, cb) => {
  finishKeypad(data.id, data.inputs);
  cb({ data, meta: { ok: true, message: 'done' } });
});

global.asyncExports('keypad', openKeypad);

UI.onApplicationClose(() => {
  forceFinishKeypad();
}, 'keypad');
