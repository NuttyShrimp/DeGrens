import { Animations, Hospital, Jobs, Police } from '@dgx/client';

const openAng = (prefix: string) => {
  if (Jobs.getCurrentJob()?.name !== 'ambulance') return;
  if (Police.isCuffed() || Hospital.isDown()) return;

  Animations.startTabletAnimation();
  SetNuiFocus(true, true);
  SendNUIMessage({
    action: 'openAng',
    site: prefix,
  });
};

on('hospital:openAng', () => {
  openAng('az');
});

on('police:openAng', () => {
  openAng('ang');
});

RegisterNuiCallbackType('angClosed');
on(`__cfx_nui:angClosed`, () => {
  SetNuiFocus(false, false);
  Animations.stopTabletAnimation();
});
