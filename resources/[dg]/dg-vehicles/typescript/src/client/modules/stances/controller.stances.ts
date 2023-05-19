import { Events, Notifications, Statebags, UI } from '@dgx/client';
import { getCurrentVehicle, isDriver } from '@helpers/vehicle';
import {
  getAppliedStance,
  removeInfoNotif,
  roundOffset,
  setCloseVehicleStance,
  updateInfoNotif,
} from './service.stances';

let stanceMenuOpen = false;
let changeStep = 0.005;

export const isStanceMenuOpen = () => stanceMenuOpen;

UI.onUIReload(() => {
  stanceMenuOpen = false;
});

UI.onApplicationClose(() => {
  if (!stanceMenuOpen) return;

  stanceMenuOpen = false;
  removeInfoNotif();
  changeStep = 0.005;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Kon stance niet opslaan...', 'error');
    return;
  }
  if (!Entity(veh).state.stance) return;
  Events.emitNet('vehicles:stance:save', NetworkGetNetworkIdFromEntity(veh));
}, 'contextmenu');

Events.onNet('vehicles:stance:openMenu', () => {
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }

  stanceMenuOpen = true;

  const getSubmenu = (wheel: string): ContextMenu.Entry[] => {
    return [
      {
        title: 'Cycle Step',
        description: 'Change amount of increase/decrese on each step',
        callbackURL: 'stance/cycleStep',
        preventCloseOnClick: true,
      },
      {
        title: 'Increase',
        callbackURL: 'stance/change',
        preventCloseOnClick: true,
        data: {
          wheel,
          action: 'increase',
        },
      },
      {
        title: 'Decrease',
        callbackURL: 'stance/change',
        preventCloseOnClick: true,
        data: {
          wheel,
          action: 'decrease',
        },
      },
    ];
  };

  const menuData: ContextMenu.Entry[] = [
    {
      title: 'Stancing Menu',
      description: 'Change stancing of corresponding wheel',
    },
    {
      title: 'Front Left',
      submenu: getSubmenu('frontLeft'),
    },
    {
      title: 'Front Right',
      submenu: getSubmenu('frontRight'),
    },
    {
      title: 'Back Left',
      submenu: getSubmenu('backLeft'),
    },
    {
      title: 'Back Right',
      submenu: getSubmenu('backRight'),
    },
  ];

  UI.openApplication('contextmenu', menuData);
});

UI.RegisterUICallback('stance/change', (data: { wheel: keyof Stance.Data; action: 'increase' | 'decrease' }, cb) => {
  if (!stanceMenuOpen) return;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }
  const offset = changeStep * (data.action === 'increase' ? 1 : -1);
  const vehState = Entity(veh).state;
  const oldStanceData: Stance.Data = vehState.stance ?? getAppliedStance(veh);
  const newOffset = roundOffset(oldStanceData[data.wheel] + offset);
  updateInfoNotif(`Value: ${newOffset}`);
  vehState.set('stance', { ...oldStanceData, [data.wheel]: newOffset }, true);
  cb({ data: {}, meta: { ok: true, message: '' } });
});

UI.RegisterUICallback('stance/cycleStep', (_, cb) => {
  if (!stanceMenuOpen) return;
  const veh = getCurrentVehicle();
  if (!veh || !isDriver()) {
    Notifications.add('Je zit niet in een voertuig als bestuurder', 'error');
    return;
  }
  const steps = [0.005, 0.01, 0.05];
  const currentIndex = steps.findIndex(s => s === changeStep);
  const newIndex = ((currentIndex === -1 ? 0 : currentIndex) + 1) % steps.length;
  changeStep = steps[newIndex];
  updateInfoNotif(`Step: ${changeStep}`);

  cb({ data: {}, meta: { ok: true, message: '' } });
});

Statebags.addEntityStateBagChangeHandler<Stance.Data | null>('entity', 'stance', (_, vehicle, stanceData) => {
  setCloseVehicleStance(vehicle, stanceData);
});
