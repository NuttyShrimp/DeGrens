import { UI } from '@dgx/client';

import { doRefuel } from '../service.fuel';

UI.RegisterUICallback('vehicles:fuel:startRefuel', (data: { netId: number }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  doRefuel(data.netId);
});
