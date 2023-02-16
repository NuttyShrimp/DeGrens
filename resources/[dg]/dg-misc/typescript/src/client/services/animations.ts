import { PropAttach, Util } from '@dgx/client';

let tabletPropId: number | null = null;

const cleanTabletProp = () => {
  if (tabletPropId === null) return;
  PropAttach.remove(tabletPropId);
  tabletPropId = null;
};

export const startTabletAnimation = async () => {
  cleanTabletProp();
  const ped = PlayerPedId();
  await Util.loadAnimDict('amb@code_human_in_bus_passenger_idles@female@tablet@base');
  TaskPlayAnim(
    ped,
    'amb@code_human_in_bus_passenger_idles@female@tablet@base',
    'base',
    3.0,
    3.0,
    -1,
    49,
    0,
    false,
    false,
    false
  );
  const propId = PropAttach.add('tablet');
  if (propId !== undefined) {
    tabletPropId = propId;
  }
};
global.exports('startTabletAnimation', startTabletAnimation);

export const stopTabletAnimation = () => {
  cleanTabletProp();
  TaskPlayAnim(
    PlayerPedId(),
    'amb@code_human_in_bus_passenger_idles@female@tablet@base',
    'exit',
    3.0,
    3.0,
    -1,
    49,
    0,
    false,
    false,
    false
  );
};
global.exports('stopTabletAnimation', stopTabletAnimation);

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  stopTabletAnimation();
});
