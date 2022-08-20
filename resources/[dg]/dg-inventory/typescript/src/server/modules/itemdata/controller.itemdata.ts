import itemDataManager from './classes/itemdatamanager';

on('dg-config:moduleLoaded', (moduleId: string) => {
  if (moduleId !== 'inventory.items') return;
  itemDataManager.seed();
});
