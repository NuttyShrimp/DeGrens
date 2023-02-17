import { Animations, Hospital, Jobs, Police } from '@dgx/client';

on('police:openAng', () => {
  if (Jobs.getCurrentJob()?.name !== 'police') return;
  if (Police.isCuffed() || Hospital.isDown()) return;

  Animations.startTabletAnimation();
  SetNuiFocus(true, true);
  SendNUIMessage({
    action: 'openAng',
  });
});

RegisterNuiCallbackType('angClosed');
on(`__cfx_nui:angClosed`, () => {
  SetNuiFocus(false, false);
  Animations.stopTabletAnimation();
});
