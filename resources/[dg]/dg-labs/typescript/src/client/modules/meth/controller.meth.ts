import { Events, Peek, UI } from '@dgx/client';
import {
  setMethSettings,
  increaseMethStatus,
  hasMethPackage,
  takeMethPackage,
  removeMethPackage,
  setMethStationSettings,
} from './service.meth';

Peek.addZoneEntry('lab_action', {
  options: [
    {
      icon: 'fas fa-power-off',
      label: 'Aanzetten',
      items: ['meth_lab_keycard'],
      action: option => {
        Events.emitNet('labs:meth:start', option.data.labId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'meth') return false;
        return option.data.action == 'start';
      },
    },
    {
      icon: 'fas fa-wrench',
      label: 'Instellen',
      action: option => {
        setMethSettings(option.data.labId, option.data.stationId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'meth') return false;
        if (option.data.action !== 'station') return false;
        return !hasMethPackage();
      },
    },
    {
      icon: 'fas fa-box',
      label: 'Vul',
      action: option => {
        increaseMethStatus(option.data.labId, option.data.stationId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'meth') return false;
        if (option.data.action !== 'station') return false;
        return hasMethPackage();
      },
    },
    {
      icon: 'fas fa-box',
      label: 'Doos nemen',
      action: option => {
        takeMethPackage(option.data.labId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'meth') return false;
        if (option.data.action !== 'package') return false;
        return !hasMethPackage();
      },
    },
    {
      icon: 'fas fa-box',
      label: 'Doos wegleggen',
      action: () => {
        removeMethPackage();
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'meth') return false;
        if (option.data.action !== 'package') return false;
        return hasMethPackage();
      },
    },
    {
      icon: 'fas fa-capsules',
      label: 'Verzamel',
      action: option => {
        Events.emitNet('labs:meth:collect', option.data.labId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'meth') return false;
        return option.data.action === 'take';
      },
    },
  ],
});

UI.RegisterUICallback('sliders/close', (data: { settings: Labs.Meth.Settings }, cb) => {
  setMethStationSettings(data.settings);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('methbrick/unpack', (data: { itemId: string }, cb) => {
  Events.emitNet('labs:meth:unpackBrick', data.itemId);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});
