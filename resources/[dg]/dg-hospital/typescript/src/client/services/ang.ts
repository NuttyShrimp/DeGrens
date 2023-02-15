import { Animations, Hospital, Jobs, Police } from '@dgx/client';

on('hospital:openAng', () => {
  if (Jobs.getCurrentJob()?.name !== 'ambulance') return;
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
