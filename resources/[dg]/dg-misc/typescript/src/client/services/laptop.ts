import { Events, UI, Util } from '@dgx/client';

let isOpen = false;
let tabletProp: number;

const openLaptop = async () => {
  if (isOpen) return;
  isOpen = true;
  let ped = PlayerPedId()
  await Util.loadAnimDict('amb@code_human_in_bus_passenger_idles@female@tablet@base');
  const tabletModel = GetHashKey('prop_cs_tablet');
  await Util.loadModel(tabletModel);
  const bone = GetPedBoneIndex(ped, 60309);
  tabletProp = CreateObject(tabletModel, 1.0, 1.0, 1.0, true, true, false);
  AttachEntityToEntity(
    tabletProp,
    ped,
    bone,
    0.03,
    0.002,
    -0.0,
    10.0,
    160.0,
    0.0,
    true,
    false,
    false,
    false,
    2,
    true
  );
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
  UI.openApplication('laptop');
};

const closeLaptop = () => {
  if (!isOpen) return;
  isOpen = false;
  DetachEntity(tabletProp, true, false);
  DeleteObject(tabletProp);
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

on('dg-ui:application-closed', (appName: string) => {
  if (appName !== 'laptop') return;
  closeLaptop();
});

on('dg-ui:reload', () => {
  closeLaptop();
});

Events.onNet('misc:client:openLaptop', () => {
  openLaptop();
});
