import { Events, Gangs, Peek } from '@dgx/client';

let peekIds: string[] = [];

export const initRestock = () => {
  peekIds = Peek.addFlagEntry('isCTMRestock', {
    distance: 3,
    options: [
      {
        icon: 'cart-plus',
        label: 'Restock',
        action: () => {
          Events.emitNet('event:ctm:restockMenu');
        },
      },
    ],
  });
};
