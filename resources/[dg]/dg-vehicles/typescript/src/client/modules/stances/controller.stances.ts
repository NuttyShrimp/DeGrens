import { Events, Keys, Notifications, Statebags, UI } from '@dgx/client';
import {
  cycleChangeStep,
  getChangeStep,
  getVehicleStance,
  handleStanceMenuClose,
  openStanceMenu,
  revertOriginalStance,
  setCloseVehicleStance,
  setVehicleStance,
  validateStanceMenuButtonAction,
} from './service.stances';
import { roundOffset, updateInfoNotif } from './helpers.stances';
import { WHEELS } from './constants.stances';

let finishCamMoving: (() => void) | null = null;

Statebags.addEntityStateBagChangeHandler<Stances.Stance | null>('entity', 'stance', (_, vehicle, stanceData) => {
  setCloseVehicleStance(vehicle, stanceData);
});

UI.onUIReload(() => {
  handleStanceMenuClose();
});

UI.onApplicationClose(() => {
  handleStanceMenuClose();
}, 'contextmenu');

Events.onNet('vehicles:stances:openMenu', openStanceMenu);

UI.RegisterUICallback('stances/change', (data: { wheel: Stances.Wheel; action: 'increase' | 'decrease' }, cb) => {
  const vehicle = validateStanceMenuButtonAction();
  if (!vehicle) return;

  const offset = getChangeStep() * (data.action === 'increase' ? 1 : -1);
  const stance = getVehicleStance(vehicle);
  const newOffset = roundOffset(stance[data.wheel] + offset);
  updateInfoNotif(`Value: ${newOffset}`);
  setVehicleStance(vehicle, { ...stance, [data.wheel]: newOffset });

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('stances/cycleStep', (_, cb) => {
  if (!validateStanceMenuButtonAction()) return;

  const newStep = cycleChangeStep();
  updateInfoNotif(`Step: ${newStep}`);

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('stances/copy', (data: { wheel: Stances.Wheel }, cb) => {
  const vehicle = validateStanceMenuButtonAction();
  if (!vehicle) return;

  const stance = getVehicleStance(vehicle);
  const linkedWheel = WHEELS.find(w => w.name === data.wheel)?.linked;
  if (!linkedWheel) throw new Error('Invalid wheel');

  setVehicleStance(vehicle, { ...stance, [linkedWheel]: stance[data.wheel] });

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('stances/reset', (_, cb) => {
  const vehicle = validateStanceMenuButtonAction();
  if (!vehicle) return;

  Notifications.add('Stance has been reset', 'info');
  revertOriginalStance(vehicle);

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('stances/moveCam', (_, cb) => {
  const vehicle = validateStanceMenuButtonAction();
  if (!vehicle) return;

  FreezeEntityPosition(vehicle, true);
  UI.showInteraction(`${Keys.getBindedKey('+GeneralUse')} - Reopen`);

  new Promise<boolean>(res => {
    const timeout = setTimeout(() => {
      Notifications.add('Camera movement timed out...', 'error');
      res(false);
    }, 5000);
    finishCamMoving = () => {
      clearTimeout(timeout);
      res(true);
    };
  }).then(resume => {
    FreezeEntityPosition(vehicle, false);
    if (resume) {
      openStanceMenu();
    }
    UI.hideInteraction();
  });

  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('stances/clipboard', (_, cb) => {
  const vehicle = validateStanceMenuButtonAction();
  if (!vehicle) return;

  const stance = getVehicleStance(vehicle);
  UI.addToClipboard(JSON.stringify(stance));
  Notifications.add('Stance copied to clipboard', 'info');

  cb({ data: {}, meta: { ok: true, message: '' } });
});

Keys.onPressDown('GeneralUse', () => {
  if (finishCamMoving === null) return;
  finishCamMoving();
  finishCamMoving = null;
});
