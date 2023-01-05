import { BLACKLISTED_MODELS } from '../constants';

const checkEntityBlacklisted = (entity: number) => {
  const model = GetEntityModel(entity);
  if (BLACKLISTED_MODELS.has(model)) {
    CancelEvent();
  }
};

on('entityCreating', (entity: number) => {
  if (DoesEntityExist(entity)) {
    checkEntityBlacklisted(entity);
  } else {
    setTimeout(() => {
      checkEntityBlacklisted(entity);
    }, 250);
  }
});
