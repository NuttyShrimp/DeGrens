import { Keys, Notifications, RPC } from '@dgx/client';
import { openPhone } from 'services/mgmt';
import { getState } from 'services/state';

let cameraThread: number | null = null;
let frontCamActive = false;
let takingPic = false;

export const startThread = () => {
  if (frontCamActive) {
    setFrontCamActive();
  }
  CreateMobilePhone(0);
  CellCamActivate(true, true);

  cameraThread = setTick(() => {
    if (getState('state') !== 2) {
      stopThread();
      return;
    }

    if (IsControlJustPressed(0, 177)) {
      stopThread();
      openPhone();
      return;
    }

    if (IsControlJustPressed(0, 176)) {
      takePicture();
    }

    if (IsControlJustPressed(0, 179)) {
      setFrontCamActive();
    }
  });
};

export const stopThread = () => {
  if (cameraThread) {
    clearTick(cameraThread);
    cameraThread = null;
  }

  CellCamActivate(false, false);
  DestroyMobilePhone();
  if (frontCamActive) {
    setFrontCamActive();
  }
};

const takePicture = async () => {
  if (takingPic) {
    Notifications.add('Foto al aan het nemen', 'error');
    return;
  }
  takingPic = true;
  Notifications.add('Foto aan het nemen, niet bewegen!');
  const imageTaken = await RPC.execute<boolean>('phone:camera:take');
  Notifications.add(imageTaken ? 'Foto genomen!' : 'Foto nemen mislukt!', imageTaken ? 'success' : 'error');
  takingPic = false;
  stopThread();
  openPhone();
};

const setFrontCamActive = () => {
  frontCamActive = !frontCamActive;
  (Citizen as any).invokeNative('0x2491a93618b7d838', frontCamActive);
};
