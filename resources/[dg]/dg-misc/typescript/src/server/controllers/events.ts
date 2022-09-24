import { BLACKLISTED_MODELS } from '../constants';

on('entityCreating', (entity: number) => {
  const model = GetEntityModel(entity);
  if (BLACKLISTED_MODELS.some(m => model === m)) {
    CancelEvent();
  }
});
