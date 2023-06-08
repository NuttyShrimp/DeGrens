import { Auth } from '@dgx/server';
import { BLACKLISTED_MODELS } from '../constants';
import { dispatchHudConfigToPlayer } from 'modules/hud/service.hud';

const isModelBlacklisted = (entity: number) => {
  if (!DoesEntityExist(entity)) return false;
  const model = GetEntityModel(entity) >>> 0;
  return BLACKLISTED_MODELS.has(model);
};

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

Auth.onAuth(plyId => {
  dispatchHudConfigToPlayer(plyId);
});
