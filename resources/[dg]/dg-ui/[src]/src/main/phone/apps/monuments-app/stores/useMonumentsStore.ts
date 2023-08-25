import { isDevel } from '@src/lib/env';
import { create } from '@src/lib/store';

export const useMonumentsStoreApp = create<{ hidden: boolean }>('phone.app.monuments')(() => ({
  hidden: !isDevel(),
}));
