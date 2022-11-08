import { Util } from "@dgx/client";

let tabletProp: number = 0;

const cleanTabletProp = () => {
  if (!tabletProp) return
  DetachEntity(tabletProp, true, false);
  DeleteObject(tabletProp);
  tabletProp = 0;
}

export const startTabletAnimation = async () => {
  cleanTabletProp();
  const ped = PlayerPedId();
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
}
global.exports("startTabletAnimation", startTabletAnimation)

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
}
global.exports("stopTabletAnimation", stopTabletAnimation)

on('onResourceStop', (res: string) => {
  if (res !== GetCurrentResourceName()) return;
  stopTabletAnimation();
})