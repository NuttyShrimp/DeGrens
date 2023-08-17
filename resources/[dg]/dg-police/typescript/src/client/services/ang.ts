import { Animations, Hospital, Jobs, Police } from '@dgx/client';

const openAng = (prefix: string) => {
  if (Police.isCuffed() || Hospital.isDown()) return;

  Animations.startTabletAnimation();
  SetNuiFocus(true, true);
  SendNUIMessage({
    action: 'openAng',
    site: prefix,
  });
};

on('hospital:openAng', () => {
  if (Jobs.getCurrentJob()?.name !== 'ambulance') return;
  openAng('az');
});

on('police:openAng', () => {
  if (Jobs.getCurrentJob()?.name !== 'police') return;
  openAng('ang');
});

RegisterNuiCallbackType('angClosed');
on(`__cfx_nui:angClosed`, () => {
  SetNuiFocus(false, false);
  Animations.stopTabletAnimation();
});
