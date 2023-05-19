import { Events, Peek, Police, RPC, UI } from '@dgx/client';
import { playSound, stopSound } from 'services/sound';
import { setState } from 'services/state';

import { CallType } from '../../shared/enums/callType';

UI.RegisterUICallback('phone/startCall', async (data: { phone: string; isAnon: CallType }, cb) => {
  const soundId = await RPC.execute('phone:calls:start', data);
  if (soundId) {
    playSound('dial', soundId);
  }
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/dispatchEndCall', async (_, cb) => {
  await RPC.execute('phone:calls:end');
  setState('inCall', false);
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/acceptCall', async (_, cb) => {
  await RPC.execute('phone:calls:initiate');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('phone/declineCall', async (_, cb) => {
  await RPC.execute('phone:calls:end');
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

Events.onNet('phone:calls:incoming', (call: Calls.IncomingCall) => {
  playSound('ring', call.soundId);
  UI.SendAppEvent('phone', {
    appName: 'phone',
    action: 'incomingCall',
    data: call,
  });
});

Events.onNet('phone:calls:endCurrent', (soundId: number) => {
  StopSound(soundId);
  setState('inCall', false);
  UI.SendAppEvent('phone', {
    appName: 'phone',
    action: 'endCurrentCall',
    data: {},
  });
});

Events.onNet('phone:calls:initiate', soundId => {
  stopSound(soundId);
  setState('inCall', true);
  UI.SendAppEvent('phone', {
    appName: 'phone',
    action: 'setCallActive',
    data: {},
  });
});

Peek.addModelEntry(
  [
    'p_phonebox_02_s',
    'prop_phonebox_03',
    'prop_phonebox_02',
    'prop_phonebox_04',
    'prop_phonebox_01c',
    'prop_phonebox_01a',
    'prop_phonebox_01b',
    'p_phonebox_01b_s',
  ],
  {
    options: [
      {
        icon: 'fas fa-phone',
        label: 'Use Payphone',
        items: ['phone'],
        action: async () => {
          const result = await UI.openInput({
            header: 'Make a call',
            inputs: [
              {
                label: 'Phone Number',
                name: 'phoneNumber',
                type: 'number',
              },
            ],
          });
          if (!result.accepted) return;

          if (!result.values.phoneNumber) return;
          UI.SendAppEvent('phone', {
            appName: 'phone',
            action: 'startCall',
            data: { target: result.values.phoneNumber, type: CallType.ANON },
          });
        },
        canInteract: () => !Police.isInPrison(),
      },
    ],
    distance: 1.5,
  }
);

asyncExports('prisonCall', async () => {
  const contacts = await RPC.execute<Contact[]>('phone:contacts:get');
  const options = (contacts ?? []).map(c => ({ label: c.label, value: c.phone }));

  const result = await UI.openInput({
    header: 'Selecteer een contactpersoon',
    inputs: [
      {
        type: 'select',
        label: 'Contact',
        name: 'phone',
        options: options,
      },
    ],
  });
  if (!result.accepted) return;

  UI.SendAppEvent('phone', {
    appName: 'phone',
    action: 'startCall',
    data: { target: result.values.phone, type: CallType.PRISON },
  });
});
