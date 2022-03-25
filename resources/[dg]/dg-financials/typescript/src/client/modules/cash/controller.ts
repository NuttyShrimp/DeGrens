global.exports('getCash', () => {
  return DGCore.Functions.TriggerCallback<number>('financials:server:cash:get');
});
