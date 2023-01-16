import { create } from '@src/lib/store';

export const useInteractionStore = create<Interaction.State & Store.UpdateStore<Interaction.State>>('interaction')(
  set => ({
    show: false,
    text: '',
    type: 'info',
    updateStore: nState => set(s => (typeof nState === 'function' ? nState(s) : nState)),
  })
);
