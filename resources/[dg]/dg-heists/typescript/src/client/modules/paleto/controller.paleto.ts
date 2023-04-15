import { Events, Peek, Police } from '@dgx/client';
import { paletoPeekCanInteractWrapper } from './helpers.paleto';

Peek.addFlagEntry('heistsPaletoCodes', {
  options: [
    {
      label: 'Omkopen',
      icon: 'fas fa-credit-card-blank',
      action: () => {
        Events.emitNet('heists:paleto:buyCodes');
      },
      canInteract: () => Police.canDoActivity('heist_paleto'),
    },
  ],
  distance: 1,
});

Peek.addZoneEntry('heist_paleto_action', {
  options: [
    {
      label: 'Code Invoeren',
      icon: 'fas fa-input-numeric',
      action: option => {
        Events.emitNet('heists:paleto:enterCode', option.data.id);
      },
      canInteract: paletoPeekCanInteractWrapper('keypad_one', 'keypad_two'),
    },
    {
      label: 'Uitschakelen',
      icon: 'fas fa-bolt-slash',
      items: 'mini_emp',
      action: () => {
        Events.emitNet('heists:paleto:emp');
      },
      canInteract: paletoPeekCanInteractWrapper('emp'),
    },
    {
      label: 'Openen',
      icon: 'fas fa-vault',
      items: 'decoding_tool',
      action: () => {
        Events.emitNet('heists:paleto:hackSafe');
      },
      canInteract: paletoPeekCanInteractWrapper('safe'),
    },
    {
      label: 'Unlock',
      icon: 'fas fa-key',
      items: 'heist_paleto_key',
      action: () => {
        Events.emitNet('heists:paleto:unlock');
      },
      canInteract: paletoPeekCanInteractWrapper('unlock'),
    },
  ],
  distance: 1.5,
});
