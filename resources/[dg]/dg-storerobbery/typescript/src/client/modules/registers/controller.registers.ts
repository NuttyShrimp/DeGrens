import { Events, Peek, PolyZone } from '@dgx/client';
import { setInRegisterZone, tryToLockpick, canLockpickRegister, lootRegister } from './service.registers';

PolyZone.onEnter('store_registers', () => {
  setInRegisterZone(true);
});
PolyZone.onLeave('store_registers', () => {
  setInRegisterZone(false);
});

Peek.addModelEntry('prop_till_01', {
  options: [
    {
      icon: 'fas fa-cash-register',
      label: 'Beroof',
      action: (_, register) => {
        if (!register) return;
        tryToLockpick(register);
      },
      canInteract: () => canLockpickRegister(),
    },
  ],
  distance: 0.8,
});

Events.onNet('storerobbery:registers:doRobbing', async (registerIdx: number, isBroken: boolean) => {
  lootRegister(registerIdx, isBroken);
});
