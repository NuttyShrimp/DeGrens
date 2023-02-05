import { Events, Inventory, Jobs, Util } from '@dgx/server';

Events.onNet('misc:radio:server:setFrequency', async (src: number, freq: number) => {
  const cid = Util.getCID(src);
  const isESFreq = freq >= 1 && freq < 11;
  const radioItem = await Inventory.getFirstItemOfName('player', String(cid), isESFreq ? 'pd_radio' : 'radio');
  if (!radioItem) {
    Events.emitNet('misc:radio:client:disconnect', src);
    return;
  }
  Inventory.setMetadataOfItem(radioItem.id, data => ({
    ...data,
    frequency: freq,
  }));
});

Inventory.registerUseable(['radio', 'pd_radio'], async (src: number, state: Inventory.ItemState) => {
  let radioFreq = state.metadata?.frequency ?? 0;
  Inventory.setMetadataOfItem(state.id, data => ({
    ...data,
    frequency: radioFreq,
  }));
  let isES = ['police', 'ambulance'].includes(Jobs.getCurrentJob(src) ?? '');
  if (radioFreq >= 1 && radioFreq < 11 && (!isES || state.name === 'radio')) {
    Inventory.setMetadataOfItem(state.id, data => ({
      ...data,
      frequency: 0,
    }));
    radioFreq = 0;
  }
  if (radioFreq > 10 && state.name === 'pd_radio') {
    Inventory.setMetadataOfItem(state.id, data => ({
      ...data,
      frequency: 0,
    }));
    radioFreq = 0;
  }
  const allowed = {
    pd: (state.name === 'pd_radio' || (await Inventory.doesPlayerHaveItems(src, 'pd_radio'))) && isES,
    normal: state.name === 'radio' || (await Inventory.doesPlayerHaveItems(src, 'radio')),
  };
  Events.emitNet('misc:radio:client:open', src, radioFreq, allowed);
});

Inventory.onInventoryUpdate(
  'player',
  async (id, _) => {
    if (!id) return;
    const plyId = DGCore.Functions.getPlyIdForCid(Number(id));
    if (!plyId) return;
    const radioAmount = await Inventory.getAmountPlayerHas(source, 'radio');
    if (radioAmount) return;
    Events.emitNet('misc:radio:client:disconnect', source);
  },
  'radio',
  'remove'
);
