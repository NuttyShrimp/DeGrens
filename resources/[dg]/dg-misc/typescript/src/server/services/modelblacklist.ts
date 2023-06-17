import { BLACKLISTED_MODELS } from '../constants';

const isModelBlacklisted = (entity: number) => {
  if (!DoesEntityExist(entity)) return false;
  const model = GetEntityModel(entity) >>> 0;
  return BLACKLISTED_MODELS.has(model);
};

// 'entityCreated' does not get emitted when using CreateVehicleServerSetter, we provide the export to manually do blacklist checking when spawning vehicle
global.exports('isModelBlacklisted', (model: number | string) => {
  const modelHash = typeof model === 'string' ? GetHashKey(model) : model;
  return BLACKLISTED_MODELS.has(modelHash >>> 0);
});

on('entityCreating', (entity: number) => {
  const blacklisted = isModelBlacklisted(entity);
  if (!blacklisted) return;
  CancelEvent();
});

on('entityCreated', (entity: number) => {
  const blacklisted = isModelBlacklisted(entity);
  if (!blacklisted) return;
  DeleteEntity(entity);
});
