import { Events, Keys, Notifications, Util } from '@dgx/client';
import contextManager from 'classes/contextmanager';
import { canOpenInventory } from '../util';

Keys.register('inventory:open', 'Open Inventory', 'TAB');
Keys.onPressUp('inventory:open', () => {
  contextManager.openInventory();
});

for (let i = 1; i <= 5; i++) {
  const keyEventName = `inventory:hotkey:${i}`;
  Keys.register(keyEventName, `Inventory Hotkey ${i}`, i.toString());
  Keys.onPressUp(keyEventName, () => {
    if (!canOpenInventory()) {
      Notifications.add('Je kan dit momenteel niet', 'error');
      return;
    }
    const canDo = Util.debounce('inventory_use', 500);
    if (!canDo) return;
    Events.emitNet('inventory:server:useHotkey', i);
  });
}
