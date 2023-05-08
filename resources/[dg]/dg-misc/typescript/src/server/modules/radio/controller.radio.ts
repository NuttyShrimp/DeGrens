import { Events, Inventory, Jobs } from '@dgx/server';
import { charModule } from 'helpers/core';

Events.onNet('misc:radio:server:setFrequency', async (src: number, freq: number) => {
  const plyJob = Jobs.getCurrentJob(src);
  const isESFreq = freq >= 1 && freq <= 10;

  // needs to be police or ambu to be on ems frequencies
  if (isESFreq && (!plyJob || ['police', 'ambulance'].indexOf(plyJob) === -1)) {
    Events.emitNet('misc:radio:client:disconnect', src);
    return;
  }

  const radioItem = await Inventory.getFirstItemOfNameOfPlayer(src, isESFreq ? 'pd_radio' : 'radio');
  if (!radioItem) {
    Events.emitNet('misc:radio:client:disconnect', src);
    return;
  }
  Inventory.setMetadataOfItem(radioItem.id, data => ({
    ...data,
    frequency: freq,
  }));
});

Jobs.onJobUpdate((src, job) => {
  if (job) return;
  const radioChannel = Player(src).state.radioChannel;
  if (!radioChannel || (radioChannel < 1 && radioChannel > 10)) return;
  global.exports['pma-voice'].setPlayerRadio(src, 0);
});

Inventory.registerUseable(['radio', 'pd_radio'], async (src: number, state: Inventory.ItemState) => {
  let radioFreq = state.metadata?.frequency ?? 0;
  Inventory.setMetadataOfItem(state.id, data => ({
    ...data,
    frequency: radioFreq,
  }));
  let isES = ['police', 'ambulance'].includes(Jobs.getCurrentJob(src) ?? '');
  if (radioFreq >= 1 && radioFreq <= 10 && (!isES || state.name === 'radio')) {
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
  async id => {
    if (!id) return;
    const plyId = charModule.getServerIdFromCitizenId(Number(id));
    if (!plyId) return;
    const radioAmount = await Inventory.getAmountPlayerHas(plyId, 'radio');
    if (radioAmount) return;
    Events.emitNet('misc:radio:client:disconnect', plyId);
  },
  'radio',
  'remove'
);
