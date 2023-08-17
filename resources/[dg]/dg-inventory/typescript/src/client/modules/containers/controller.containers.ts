import { Events, UI } from '@dgx/client';
import contextManager from 'classes/contextmanager';

UI.RegisterUICallback('inventory/containers/open', (data: { containerId: string }, cb) => {
  contextManager.openInventory({ type: 'container', identifier: data.containerId });
  cb({ data: {}, meta: { ok: true, message: 'done' } });
});

UI.RegisterUICallback('inventory/containers/label', async (data: { containerId: string; label: string }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });

  const result = await UI.openInput<{ label: string }>({
    header: 'Geef het label voor je container',
    inputs: [
      {
        type: 'text',
        label: 'Label',
        name: 'label',
        value: data.label,
      },
    ],
  });
  if (!result.accepted) return;

  Events.emitNet('inventory:containers:label', data.containerId, result.values.label);
});
