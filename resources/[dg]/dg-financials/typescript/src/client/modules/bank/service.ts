import { Peek } from '@ts-shared/client/classes/peek';
import UI from '@ts-shared/client/classes/ui';
import { ProgressbarAnimation } from '@ts-shared/client/types/core';

import { LocationManager } from '../../classes/LocationManager';
import { config } from '../../config';

const peekIds: Record<string, number[]> = {};

export const registerPeekZones = () => {
  const LManager = LocationManager.getInstance();
  peekIds.paycheck = Peek.addFlagEntry('isBanker', {
    options: [
      {
        label: 'paycheck',
        icon: 'fas fa-file-invoice-dollar',
        type: 'server',
        event: 'financials:server:paycheck:give',
      },
    ],
    distance: 2.5,
  });
  peekIds.atm = Peek.addModelEntry(config.ATMModels, {
    options: [
      {
        label: 'ATM',
        icon: 'fas fa-university',
        async action() {
          await doAnimation(true, true);
          LManager.setAtATM(true);
          const base = await DGCore.Functions.TriggerCallback<BaseState>('financials:accounts:open', 'ATM');
          base.isAtm = true;
          UI.openApplication('financials', base);
          SetNuiFocus(true, true);
        },
      },
    ],
    distance: 2.0,
  });
};

export const unregisterPeekZones = () => {
  console.log('unregistering peek zones', peekIds);
  Peek.removeFlagEntry(peekIds.paycheck);
  Peek.removeModelEntry(peekIds.atm);
};

export const doAnimation = async (isAtm: boolean, isOpen: boolean) => {
  await new Promise<void>((res, rej) => {
    const anim: ProgressbarAnimation = isAtm
      ? isOpen
        ? {
            anim: 'idle_b',
            flags: 49,
            animDict: 'amb@prop_human_atm@male@idle_a',
          }
        : {
            anim: 'exit',
            flags: 49,
            animDict: 'amb@prop_human_atm@male@exit',
          }
      : {
          anim: 'givetake1_a',
          flags: 49,
          animDict: 'mp_common',
        };
    DGCore.Functions.Progressbar(
      'open_atm',
      config.animText[isOpen ? 'open' : 'close'],
      1000,
      false,
      false,
      {
        disableCarMovement: true,
        disableCombat: true,
        disableMouse: false,
        disableMovement: true,
      },
      anim,
      {},
      {},
      () => {
        res();
      },
      () => {
        rej();
      }
    );
  });
};
