import { Peek, PolyZone } from '@dgx/client';
import { setInRegisterZone, lockpickRegister, canRobRegister } from './service.registers';

PolyZone.onEnter('store_registers', () => {
  setInRegisterZone(true);
});
PolyZone.onLeave('store_registers', () => {
  setInRegisterZone(false);
});

Peek.addModelEntry(
  'prop_till_01',
  {
    options: [
      {
        icon: 'fas fa-cash-register',
        label: 'Beroof',
        action: (_, register) => {
          if (!register) return;
          lockpickRegister(register);
        },
        canInteract: () => canRobRegister(),
      },
    ],
    distance: 0.8,
  },
  true
);
