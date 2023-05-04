import { Core, Events, UI, Util } from '@dgx/client';
import { openRadio, setFreq, stopRadioAnimation, toggleRadio } from './service.radio';

Core.onPlayerUnloaded(() => {
  toggleRadio(false);
});

Events.onNet('misc:radio:client:open', (freq: number, allowed: { pd: boolean; normal: boolean }) => {
  openRadio(freq, allowed);
});

Events.onNet('misc:radio:client:disconnect', () => {
  toggleRadio(false, true);
});

UI.RegisterUICallback('radio/toggle', (data: { toggle: boolean }, cb) => {
  if (data?.toggle === undefined) return;
  toggleRadio(data.toggle);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('radio/setFrequency', (data, cb) => {
  if (Number.isNaN(Number(data.frequency))) return;
  setFreq(Number(data.frequency));
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.onApplicationClose(() => {
  stopRadioAnimation();
}, 'radio');

UI.onUIReload(() => {
  stopRadioAnimation();
});

// Radialmenu options
on('misc:radio:setFrequency', (data: { frequency: number }) => {
  setFreq(data.frequency, true);
});
