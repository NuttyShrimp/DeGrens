import { entryManager } from '../classes/entryManager';

const addExports = {
  addModelEntry: 'model',
  addEntityEntry: 'entity',
  addBoneEntry: 'bones',
  addFlagEntry: 'flags',
  addZoneEntry: 'zones',
  addGlobalEntry: 'global',
};
for (const [key, value] of Object.entries(addExports)) {
  global.exports(key, (id: PeekValueType | PeekValueType[], peekInfo: EntryAddParameter) => {
    return entryManager.addEntry(value as PeekEntryType, id, peekInfo);
  });
}

const removeExports = {
  removeModelEntry: 'model',
  removeEntityEntry: 'entity',
  removeBoneEntry: 'bones',
  removeFlagEntry: 'flags',
  removeZoneEntry: 'zones',
  removeGlobalEntry: 'global',
};

for (const [key, value] of Object.entries(removeExports)) {
  global.exports(key, (id: string | string[]) => {
    entryManager.removeEntry(value as PeekEntryType, id);
  });
}

global.exports['dg-lib'].registerKeyMapping('playerPeek', 'Open peek eye', '+playerPeek', '-playerPeek', 'LMENU', true);
