import { RPC } from '@dgx/server';
import { mainLogger } from 'sv_logger';
import { charModule } from './core';

const modelTypes: Record<string, string> = {};

export const getModelType = async (model: string) => {
  // we use core to make sure player is loaded to avoid getting players in loadingscreen
  const modelCheckPlayer = Object.keys(charModule.getAllPlayers())[0];
  if (!modelCheckPlayer) {
    mainLogger.error(`getModelType: no players available to get modeltype`);
    return;
  }

  if (modelTypes[model]) return modelTypes[model];

  const newModelType = await RPC.execute<string | undefined>('vehicles:getModelType', +modelCheckPlayer, model);
  if (!newModelType) {
    mainLogger.error(`getModelType: invalid model ${model}`);
    return;
  }

  modelTypes[model] = newModelType;
  return newModelType;
};
