import { Events } from '@dgx/server';
import { MODELS_PER_STAGE } from './constants.weed';

export const sendWeedPlantModelsToClient = (plyId: number) => {
  Events.emitNet('criminal:weed:setModels', plyId, MODELS_PER_STAGE);
};

export const getCurrentSeconds = () => Math.round(Date.now() / 1000);
