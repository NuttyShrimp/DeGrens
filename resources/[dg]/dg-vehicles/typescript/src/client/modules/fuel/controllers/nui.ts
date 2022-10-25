import { UI } from '@dgx/client';

import { doRefuel } from '../service.fuel';

UI.RegisterUICallback('vehicles:fuel:startRefuel', (data: { price: number; vin: string; fuel: number }, cb) => {
  cb({ data: {}, meta: { ok: true, message: 'done' } });
  doRefuel(data.price, data.vin, data.fuel);
});
